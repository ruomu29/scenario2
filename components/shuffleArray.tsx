export const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i> 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        if (i != j) {
            [array[i], array[j]] = [array[j], array[i]]
        }
    }

    return array;
}