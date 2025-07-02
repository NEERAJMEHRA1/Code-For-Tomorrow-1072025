class customerResponse {
    constructor(instant) {
        this.createdBy = instant.createdBy ? instant.createdBy : null;
        this.customerId = instant._id ? instant._id : null;
        this.createdBy = instant.createdBy ? instant.createdBy : null;
        this.name = instant.name ? instant.name : '';
        this.email = instant.email ? instant.email : '';
        this.companyName = instant.companyName ? instant.companyName : '';
        this.phone = instant.phone ? instant.phone : '';
        this.address = instant.address ? instant.address : '';
        this.city = instant.city ? instant.city : '';
        this.zipCode = instant.zipCode ? instant.zipCode : '';
        this.creditLimit = instant.creditLimit ? instant.creditLimit : 0;
        this.createdAt = instant.createdAt ? instant.createdAt : '';
    }
};

export default customerResponse;