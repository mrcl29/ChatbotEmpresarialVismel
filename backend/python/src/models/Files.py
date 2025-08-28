# backend/python/src/models/Files.py
from typing import Any, List
from pydantic import BaseModel, Field, ConfigDict

class File(BaseModel):
    """
    Fichero que se adjunta con el agente.
    """
    id: Any = ""
    name: str = ""

class FileList(BaseModel):
    """
    Lista de attachments para adjuntar al bot
    """
    files: List[File] = Field(default_factory=list)
    
    model_config = ConfigDict(arbitrary_types_allowed=True)
         
    def push(self, file: File):
        self.files.append(file)
    
    def is_file_in_list_by_id(self, id: str) -> bool:
        for file in self.files:
            if file.id == id:
                return True
        return False
    
    def is_file_in_list_by_name(self, name: str) -> bool:
        for file in self.files:
            if file.name == name:
                return True
        return False
        
    def get_all_files_ids(self) -> List[str]:
        ids = []
        for file in self.files:
            ids.append(file.id)
        return ids
        
    def get_file_by_name(self, name: str) -> File | None:
        for file in self.files:
            if file.name == name:
                return file
            
    def get_file_by_id(self, id: str) -> File | None:
        for file in self.files:
            if file.id == id:
                return file
        
    def is_empty(self) -> bool:
        return len(self.files) == 0
    
    def delete_file_by_id(self, id: str) -> File | None:
        for file in self.files[:]:
            if file.id == id:
                self.files.remove(file)
                return file
        return None
    
    def delete_file_by_name(self, name: str) -> File | None:
        for file in self.files[:]:
            if file.name == name:
                self.files.remove(file)
                return file
        return None