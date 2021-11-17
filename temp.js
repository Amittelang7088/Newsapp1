let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

nums = nums.filter((num) => {
    if(num != 3)
    return num;
})

console.log(nums);