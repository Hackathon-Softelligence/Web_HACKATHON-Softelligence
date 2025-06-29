import apiClient from "../utils/apiClient"

export const getExamById = async (id: string) => {
    const res = await apiClient.get(`/api/exams/${id}`)
    return res.data
}
