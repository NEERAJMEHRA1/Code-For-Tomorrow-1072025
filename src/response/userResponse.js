import config from "../helper/envconfig/envVars.js";

class userResponse {
    constructor(instant) {
        this.name = instant.name ? instant.name : '';
        this.email = instant.email ? instant.email : '';
        this.companyName = instant.companyName ? instant.companyName : '';
        this.phone = instant.phone ? instant.phone : '';
        this.address = instant.address ? instant.address : '';
        this.city = instant.city ? instant.city : '';
        this.zipCode = instant.zipCode ? instant.zipCode : '';
        this.logo = instant.logo ? config.IMAGE_ACCESS_URL + instant.logo : '';
        this.createdAt = instant.createdAt ? instant.createdAt : '';
    }
};

export default userResponse;