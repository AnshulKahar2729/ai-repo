import {  useQueryClient } from "@tanstack/react-query";

export const useRefetch = () => {
const queryClient = useQueryClient();   
return async () => {
    await queryClient. refetchQueries({
        type : "active"
    });
  }
} 

