const _ = require('underscore');

function gridOfRandomImages(){

    const numberOfGrid = 16
    const numberOfGridInARow = 4
    const images = Array.from({length: 16}, (_, i) => i+1)
    const randomImages = _.sample(images, numberOfGrid)

    const gridOfRandomImsges = []

    for(let i = 0;i<16; i+=4){

        gridOfRandomImsges.push(randomImages.slice(i, i+4))
    }

    console.log(gridOfRandomImsges);

    return gridOfRandomImsges
}

module.exports = gridOfRandomImages