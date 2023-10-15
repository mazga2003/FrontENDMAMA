require('dotenv').config();

const key = process.env.NFT_STORAGE_API_KEY;

const axios = require('axios');

export const pinJSONToIPFS = async (JSONBody) => {
    const url = "https://api.nft.storage/upload";

    return axios.post(url, JSONBody, {
        headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "*/*",
        }
    })
    .then(function(response) {
        return {
            "success": true,
            "ipfs": "ipfs://" + response.data.value.cid,
        };
    })
    .catch(function(error) {
        console.log(error);
        return {
            "success": false,
            "ipfs": "",
        }
    })
}