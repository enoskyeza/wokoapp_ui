'use server'
import axios, {AxiosError} from 'axios';

export const approvePayment = async (id:number) => {

    const prodUrl = `https://kyeza.pythonanywhere.com/register/contestants/${id}/`
    // const devUrl = `http://127.0.0.1:8000/register/contestants/${id}/`

    const requestData = {
        payment_status: 'paid'
    };

    try {
        const response = await axios.patch(prodUrl, requestData);
        console.log('approving payment...',response)
        return {success: true, data: response.data};
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            return {success: false, errors: axiosError.response.data};
        } else {
            return {success: false, errors: {general: 'An unexpected error occurred.'}};
        }
    }
};
