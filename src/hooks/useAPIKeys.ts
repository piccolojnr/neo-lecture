import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';

interface APIKey {
    id: string;
    name: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
}

interface CreateAPIKeyInput {
    name: string;
    key: string;
    provider: string;
}

interface UpdateAPIKeyInput {
    id: string;
    name?: string;
    key?: string;
}

export const useAPIKeys = () => {
    const queryClient = useQueryClient();

    const getAPIKeys = useQuery({
        queryKey: ['apiKeys'],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/api-keys`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data as APIKey[];
        },
    });

    const getProviderKey = async (provider: string) => {
        try {
            const response = await axios.get(`${API_URL}/api-keys/provider/${provider}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data.key;
        } catch (error: any) {
            console.error('Error fetching provider key:', error);
            return null;
        }
    };

    const createAPIKey = useMutation({
        mutationFn: async (data: CreateAPIKeyInput) => {

            const response = await axios.post(
                `${API_URL}/api-keys`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
        },
    });

    const updateAPIKey = useMutation({
        mutationFn: async (data: UpdateAPIKeyInput) => {
            const response = await axios.put(
                `${API_URL}/api-keys/${data.id}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
        },
    });

    const deleteAPIKey = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.delete(
                `${API_URL}/api-keys/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
        },
    });

    return {
        apiKeys: getAPIKeys.data || [],
        isLoading: getAPIKeys.isLoading,
        error: getAPIKeys.error,
        getProviderKey,
        createAPIKey,
        updateAPIKey,
        deleteAPIKey,
    };
};
