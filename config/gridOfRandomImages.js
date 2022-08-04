const _ = require('underscore');
const createToken = require('../config/createToken');

function gridOfRandomImages(){

    const numberOfGrid = 16
    const numberOfGridInARow = 4
    // const images = Array.from({length: 16}, (v, i) => i+1) // [1, 2, 3, 4,....16]
    const images = Array.from({length: 16}, (v, i) =>{ 
        const obj = {};
        obj[i + 1] = createToken({key:process.env[i + 1]}, process.env.IMAGE_SECRET_KEY, '300s');
        return obj
    }) 
    const randomImages = _.sample(images, numberOfGrid)

    const gridOfRandomImages = []

    for(let i = 0;i<16; i+=numberOfGridInARow){

        gridOfRandomImages.push(randomImages.slice(i, i+numberOfGridInARow))
    }


    return gridOfRandomImages
}

module.exports = gridOfRandomImages