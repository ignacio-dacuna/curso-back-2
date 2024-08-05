import { productModel } from "./models/product.model.js";

const getAll = async (query, options) => {
    const products = await productModel.paginate(query, options);
    return products;
};


const getById = async (id) => {
    const product = await productModel.findById(id);
    return product  
}

const create = async (data) => {
    const product = await productModel.create(data);
    return product  
}

const update = async (id, data) => {
    const product = await productModel.findByIdAndUpdate(id,data, {new: true}) 
    return product  
}

const deleteOne = async (id) => {
    const products = await productModel.findByIdAndUpdate(id, {status: false}, {new: true});
    return products  
}

export default {
    getAll,
    getById,
    create,
    update,
    deleteOne,
}