

let arr = [
    {
        name: 'wang',
        age: 33,
        son: {
            name:'zhao',
            age: 11
        }
    },
    {
        name: 'li',
        age: 44,
        son: {
            name: 'zhou',
            age: 22,
            son: {
                name: 'liu',
                age: 1
            }
        }
    },

]
function copy(obj) {
    var newObj = obj.constructor === Array?[]:{}
    if(typeof obj !== 'object') {
        return
    }
    for(let i in obj) {
        newObj[i] = typeof obj[i]==='object'? copy(obj[i]) : obj[i]
    }
    return newObj
}

console.log(copy(arr))