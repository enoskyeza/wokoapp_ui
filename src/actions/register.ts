'use server'
import axios, {AxiosError} from 'axios';

export const registerContestant = async (formData: FormData) => {
    const prodUrl = 'https://kyeza.pythonanywhere.com/register/parents/'
    // const devUrl = 'http://127.0.0.1:8000/register/parents/'

    // Guardian data
    const guardianData = {
        first_name: formData.get('guardian_first_name') as string,
        last_name: formData.get('guardian_last_name') as string,
        profession: formData.get('guardian_profession') as string,
        address: formData.get('guardian_address') as string,
        email: formData.get('guardian_email') as string,
        phone_number: formData.get('guardian_phone_number') as string,
    };

    // Contestants data
    const contestantsData = [];
    let i = 0;
    while (formData.has(`participant-first-name-${i}`)) {
        contestantsData.push({
            first_name: formData.get(`participant-first-name-${i}`) as string,
            last_name: formData.get(`participant-last-name-${i}`) as string,
            email: formData.get(`participant-email-${i}`) as string,
            age: parseInt(formData.get(`participant-age-${i}`) as string, 10),
            gender: formData.get(`participant-gender-${i}`) as string,
            school: formData.get(`participant-school-${i}`) as string,
            payment_method: {
                payment_method: formData.get('payment_method') as string // Nested payment method
            },
        });
        i++;
    }

    // Combined data for ParentCreateUpdateSerializer
    const requestData = {
        ...guardianData,
        contestants: contestantsData
    };

    // console.log('Form Submitted(Sever):', requestData);

    try {
        const response = await axios.post(prodUrl, requestData);
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
