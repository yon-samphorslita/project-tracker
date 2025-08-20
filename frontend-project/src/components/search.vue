<template>
    <div class="search-container">
        <div class="search-wrapper">
            <input type="text" placeholder="Search..." class="search-input">
            <!-- <button class="search-button">Search</button> -->
        </div>
        
    </div>
</template>

<script>

</script>

<style scoped>
.search-container {
    width: 100%;
    height: 50px;               
    display: flex;
    justify-content: center;        
    align-items: center;
    position: fixed;
    top: 100px;
    left: 250px; /* Adjust based on sidebar width */
    z-index: 1000;
    /* background-color: pink; */
}     
.search-wrapper {
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
}  
.search-input {
    width: 400px;
    /* height: 20px; */
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* outline: none; */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}
/* .search-button {
    padding: 10px 20px;
    margin-left: 10px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
.search-button:hover {
    background-color: #0056b3;
} */
</style>