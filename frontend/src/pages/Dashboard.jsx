// frontend/src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import { getDashboardInfo } from "../api/dashboard";
import Chart from "../components/ui/Chart.jsx";
import * as echarts from "echarts";
import mallorcaGeoJSON from "../assets/baleares.json";
import PC from "../constants/postalCodes.js";

echarts.registerMap("mallorca", mallorcaGeoJSON);

const Dashboard = () => {
  const [MachineType, setMachineType] = useState([]);
  const [MachineFaults, setMachineFaults] = useState([]);
  const [MachineReviews, setMachineReviews] = useState([]);
  // const [ClientLocations, setClientLocations] = useState([]);
  const [ClientCoords, setClientCoords] = useState([]);

  const { token } = useAuth();
  const effectRan = useRef(false);
  // const chartRef = useRef(null);

  // Función para convertir dirección/población en coordenadas usando Nominatim
  const fetchCoordinates = async (client) => {
    let pc = client.codigo_postal.toString().padStart(5, "0");
    try {
      const coord = PC[pc];
      if (coord) {
        return [parseFloat(coord.lng), parseFloat(coord.lat)];
      }
    } catch (err) {
      console.error("Error fetching coordinates for", client.nombre, err);
    }
    return null;
  };

  useEffect(() => {
    if (effectRan.current) return; // evita la segunda ejecución en dev

    const infoTypes = [
      "machine_type",
      "machine_faults",
      "machine_reviews",
      "client_locations",
    ];

    const fetchDashboardData = async () => {
      try {
        const results = await Promise.all(
          infoTypes.map((info) => getDashboardInfo(token, info))
        );

        setMachineType(results[0].results);
        setMachineFaults(results[1].results);
        setMachineReviews(results[2].results);
        // setClientLocations(results[3].results);

        // console.log("MachineType:", results[0].results);
        // console.log("MachineFaults:", results[1].results);
        // console.log("MachineReviews:", results[2].results);
        // console.log("ClientLocations:", results[3].results);

        // Obtener coordenadas para el mapa
        const coordsResults = await Promise.all(
          results[3].results.map(async (client) => {
            const coords = await fetchCoordinates(client);
            return coords ? { name: client.nombre, value: coords } : null;
          })
        );
        setClientCoords(coordsResults.filter(Boolean));
        // console.log(ClientCoords);
      } catch (err) {
        console.error("Error fetching dashboard info:", err);
      }
    };
    fetchDashboardData();
    effectRan.current = true;
  }, []);

  // Convertimos los datos para el chart
  const machineTypeChartData = MachineType.map((item) => ({
    value: Number(item.total),
    name: item.tipo,
  }));

  const totalMachines = machineTypeChartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[80%] max-w-7xl grid grid-cols-2 gap-6">
        <div className="aspect-square p-5 bg-white rounded-xl shadow-xl">
          <Chart
            title="Número de Máquinas por Tipo"
            subtext={`Total: ${totalMachines}`}
            legend={{ orient: "horizontal", left: "left" }}
            series={[
              {
                name: "Tipo de Máquina",
                type: "pie",
                radius: "50%",
                data: machineTypeChartData,
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0,0,0,0.5)",
                  },
                },
              },
            ]}
          />
        </div>

        <div className="aspect-square p-5 bg-white rounded-xl shadow-xl">
          <Chart
            title="Averías por Prioridad"
            legend={{ orient: "horizontal", left: "center" }}
            series={[
              {
                name: "Pendientes",
                type: "bar",
                stack: "total",
                label: { show: true },
                emphasis: { focus: "series" },
                data: [
                  ...MachineFaults.filter((f) => f.estado === "Pendientes").map(
                    (f) => Number(f.total)
                  ),
                ],
              },
              {
                name: "Completadas",
                type: "bar",
                stack: "total",
                label: { show: true },
                emphasis: { focus: "series" },
                data: [
                  ...MachineFaults.filter(
                    (f) => f.estado === "Completadas"
                  ).map((f) => Number(f.total)),
                ],
              },
            ]}
            yAxis={{
              type: "category",
              data: [
                ...new Set(
                  MachineFaults.map((f) => `Prioridad ${f.prioridad}`)
                ),
              ],
            }}
            xAxis={{ type: "value" }}
          />
        </div>

        <div className="aspect-square p-5 bg-white rounded-xl shadow-xl">
          <Chart
            title="Clientes en Mallorca"
            geo={{
              map: "mallorca",
              roam: true,
              label: { show: false },
              itemStyle: { areaColor: "#f3f3f3", borderColor: "#999" },
              emphasis: { itemStyle: { areaColor: "#c8e6c9" } },
            }}
            tooltip={{
              trigger: "item",
              formatter: "{b} : ({c})",
            }}
            series={[
              {
                name: "Clientes",
                type: "scatter",
                coordinateSystem: "geo",
                data: ClientCoords,
                symbolSize: 10,
                itemStyle: { color: "#ff5722" },
              },
            ]}
          />
        </div>

        <div className="aspect-square p-5 bg-white rounded-xl shadow-xl flex flex-col">
          <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10 p-2">
            Próximas Revisiones de Máquinas
          </h2>
          <div className="grid grid-cols-2 gap-4 overflow-y-auto flex-1">
            {MachineReviews.map((review) => (
              <div
                key={review.id}
                className="w-full p-4 bg-white border-1 border-gray-300 rounded-lg shadow-lg hover:shadow-lg transition-shadow"
              >
                <p className="font-medium">Máquina: {review.codigo}</p>
                <p className="text-sm text-gray-400">{review.tipo}</p>
                <p className="text-sm text-gray-500">{review.empleado}</p>
                <div className="text-sm text-gray-600 mt-2">
                  {new Date(review.fecha_prevista).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
