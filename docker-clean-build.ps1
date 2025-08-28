# Nombre del proyecto docker-compose (ajustar si usas -p o nombre distinto)
$composeProjectName = Split-Path -Leaf (Get-Location)

Write-Host "Deteniendo y eliminando contenedores..."
docker-compose down --volumes --remove-orphans

Write-Host "Eliminando imágenes del proyecto..."
$images = docker images --filter "reference=$composeProjectName_*" --format "{{.ID}}"
if ($images) {
    $images | ForEach-Object { docker rmi -f $_ }
}

Write-Host "Eliminando volúmenes huérfanos..."
docker volume prune -f

Write-Host "Eliminando redes huérfanas..."
docker network prune -f

Write-Host "Construyendo sin cache..."
docker-compose build --no-cache

Write-Host "Arrancando en segundo plano..."
docker-compose up -d

Write-Host "Proceso completado."
