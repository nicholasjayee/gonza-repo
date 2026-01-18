export const ProductService = {
    async fetchProducts() {
        return [
            { id: '1', name: 'Product A', category: 'Hardware', price: 1500, cost: 1000 },
            { id: '2', name: 'Product B', category: 'Software', price: 2500, cost: 1500 }
        ];
    },
    async createProduct(data: any) {
        return { id: Math.random().toString(), ...data };
    }
};
