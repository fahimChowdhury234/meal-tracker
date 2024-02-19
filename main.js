// Funktion til at skifte mellem menuer
function showMenu(menuId) {
    const menus = document.querySelectorAll(".menu-content");
    menus.forEach((menu) => (menu.style.display = "none"));

    const selectedMenu = document.getElementById(menuId);
    if (selectedMenu) {
        selectedMenu.style.display = "block";
    }
}

let selsectFoodID;
let selsectFoodName;
async function hentMåltiderFraAPI() {
    try {
        const respons = await fetch("https://nutrimonapi.azurewebsites.net/api/FoodItems", {
            headers: {
                "X-API-Key": "171007",
            },
        });
        const data = await respons.json();

        return data; // Returnerer dataene fra API'et
    } catch (fejl) {
        console.error("Fejl ved hentning af måltider:", fejl);
        return null;
    }
}

async function getFoodName() {
    const foodItems = await hentMåltiderFraAPI();
    const availableFoodElement = document.getElementById("availableFood");

    if (foodItems && foodItems.length > 0) {
        // Create a string to hold the HTML content
        let foodNamesHTML = "";

        // Iterate through each food item and append its name to the foodNamesHTML string
        foodItems.forEach((foodItem) => {
            const foodName = foodItem.foodName;

            foodNamesHTML += `<p class="foodName">${foodName}</p>`;
        });

        // Set the inner HTML of the availableFoodElement to the generated HTML string
        availableFoodElement.innerHTML = foodNamesHTML;

        // Add event listeners to each food name element
        const foodNameElements = document.querySelectorAll(".foodName");
        foodNameElements.forEach((element) => {
            element.addEventListener("click", () => {
                // Change background color of the selected food name
                element.style.backgroundColor = "lightblue";

                // Reset background color of previously selected food name
                foodNameElements.forEach((el) => {
                    if (el !== element) {
                        el.style.backgroundColor = "";
                    }
                });
                const clickedName = element.textContent.toString();
                selsectFoodName = clickedName;
                if (clickedName !== null) {

                    foodItems.forEach((element) => {
                        if (element.foodName !== null) {
                            if (element.foodName.includes(clickedName)) {
                                selsectFoodID = element.foodID;
                            }
                        }
                    });
                }
            });
        });
    } else {
        availableFoodElement.textContent = "No food items available.";
    }
}

// Call getFoodName function when the page loads
getFoodName();

let quantityValue = null;
let ingredientsData = [];
let totalData = {};
// Get the quantity input element
const quantityInput = document.getElementById("quantity");

// Add event listener for the "input" event
quantityInput.addEventListener("input", function () {
    // Update the quantityValue variable with the current value of the input field
    quantityValue = this.value;
});

document.getElementById("addIngredientsBtn").addEventListener("click", async function (event) {
    event.preventDefault();

    if (quantityValue == null) {
        return false;
    }

    document.getElementById("lodder").style.display = "block";

    try {
        // Fetch data for all ingredients
        const fetchedData = await Promise.all([gotData(selsectFoodID, 1030), gotData(selsectFoodID, 1110), gotData(selsectFoodID, 1310), gotData(selsectFoodID, 1240)]);

        // Create an object with the desired structure for each ingredient and push it into ingredientsData array
        ingredientsData.push({
            id: ingredientsData.length,
            foodName: selsectFoodName,
            quantity: quantityValue,
            energy: fetchedData[0][0].resVal,
            protein: fetchedData[1][0].resVal,
            fat: fetchedData[2][0].resVal,
            fiber: fetchedData[3][0].resVal,
        });

        document.getElementById("lodder").style.display = "none";
        document.getElementById("ingredientsTable").style.display = "table";

        // Show data in the table
        displayTableData();
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
});

async function gotData(foodId, sortKey) {
    const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodId}/BySortKey/${sortKey}`;
    const apiKey = "171007";

    try {
        const response = await fetch(apiUrl, {
            headers: {
                "X-API-Key": apiKey,
            },
        });

        if (!response.ok) {
            console.log(response.error);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}
// Function to get the nutrient name based on sortKey
function getNutrientName(sortKey) {
    switch (sortKey) {
        case 1030:
            return "Energy (kcal)";
        case 1110:
            return "Protein (g)";
        case 1310:
            return "Fat (g)";
        case 1240:
            return "Fiber (g)";
        default:
            return "";
    }
}

function displayTableData() {
    const tbody = document.getElementById("ingredientsBody");

    // Clear existing table data
    tbody.innerHTML = "";

    // Initialize total values
    let totalEnergy = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalQuantity = 0;

    // Populate table with fetched data
    ingredientsData.forEach((item) => {
        // Convert values to numbers and replace commas with periods
        const quantity = +item.quantity.replace(",", ".");
        const energy = +item.energy.replace(",", ".");
        const protein = +item.protein.replace(",", ".");
        const fat = +item.fat.replace(",", ".");
        const fiber = +item.fiber.replace(",", ".");

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.foodName}</td>
            <td>${quantity.toFixed(2)}</td>
            <td>${energy.toFixed(2)}</td>
            <td>${protein.toFixed(2)}</td>
            <td>${fat.toFixed(2)}</td>
            <td>${fiber.toFixed(2)}</td>
        `;
        tbody.appendChild(row);

        // Update totals
        totalQuantity += quantity;
        totalEnergy += energy;
        totalProtein += protein;
        totalFat += fat;
        totalFiber += fiber;
    });

    // Append total row
    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `
        <td>Total</td>
        <td>${totalQuantity.toFixed(2)}</td>
        <td>${totalEnergy.toFixed(2)}</td>
        <td>${totalProtein.toFixed(2)}</td>
        <td>${totalFat.toFixed(2)}</td>
        <td>${totalFiber.toFixed(2)}</td>
    `;
    tbody.appendChild(totalRow);

    // Update totalData object
    totalData = {
        totalQuantity: totalQuantity.toFixed(2),
        totalEnergy: totalEnergy.toFixed(2),
        totalProtein: totalProtein.toFixed(2),
        totalFat: totalFat.toFixed(2),
        totalFiber: totalFiber.toFixed(2),
    };
}

// Initialize an array to store meal data

let mealDataArray = [];

document.addEventListener("DOMContentLoaded", function () {
    // Check if data exists in local storage
    if (localStorage.getItem("mealDataArray")) {
        mealDataArray = JSON.parse(localStorage.getItem("mealDataArray"));

        displayMealDataInTable();

    }

    // Add event listener to form submission
    document.getElementById("addBtn").addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default form submission

        // Gather data from form fields
        const mealName = document.getElementById("mealName").value;
        const addedOn = document.getElementById("addedOn").value;
        const mealType = document.getElementById("mealType").value;
        const timeEaten = document.getElementById("timeEaten").value;

        // Construct ingredients array
        const ingredients = [];
        const rows = document.querySelectorAll("#ingredientsBody tr");
        rows.forEach((row) => {
            const columns = row.querySelectorAll("td");
            const ingredient = {
                name: columns[0].textContent,
                quantity: columns[1].textContent,
                energy: columns[2].textContent,
                protein: columns[3].textContent,
                fat: columns[4].textContent,
                fiber: columns[5].textContent,
            };
            ingredients.push(ingredient);
        });

        // Construct object with all data for this meal
        const mealData = {
            mealName: mealName,
            addedOn: addedOn,
            mealType: mealType,
            ingredients: ingredients, // Add individual ingredient data
            timeEaten: timeEaten,
        };

        // Add the mealData object to the mealDataArray
        mealDataArray.push(mealData);
        localStorage.setItem("mealDataArray", JSON.stringify(mealDataArray));

        if (mealName == "" || addedOn == "" || mealType == "" || timeEaten == "") {
            return false;
        }

        // Now you have all the data in mealDataArray, you can do whatever you want with it

        document.getElementById("mealDataTable").style.display = "table";
        // Reset form fields
        ingredientsData = [];
        document.getElementById("ingredientsTable").style.display = "none";

        document.getElementById("mealName").value = "";
        document.getElementById("addedOn").value = "";
        document.getElementById("mealType").value = "";
        document.getElementById("timeEaten").value = "";
        quantityInput.value = "";
        getFoodName();

        $("#exampleModal").modal("hide");
        displayMealDataInTable();

        // Store updated data in local storage

        // Here you can further process the mealDataArray, such as sending it to a server, saving it locally, etc.
    });
});

function displayMealDataInTable() {
    const tableBody = document.getElementById("mealDataTableBody");
    if (mealDataArray.length > 0) {
        document.getElementById("mealDataTable").style.display = "table";
    } else {
        document.getElementById("mealDataTable").style.display = "none";

    }
    // Clear existing table data
    tableBody.innerHTML = "";

    // Iterate through each meal data in the mealDataArray
    mealDataArray.forEach((mealData, index) => {
        // Create a new row for each meal
        const row = tableBody.insertRow();

        // Add cells for each meal property
        const cellIndex = row.insertCell(0);
        const cellMealName = row.insertCell(1);
        const cellAddedOn = row.insertCell(2);

        const cellIngredients = row.insertCell(3); // New cell for ingredients
        const cellTotalEnergy = row.insertCell(4); // New cell for total energy
        const cellTimeEaten = row.insertCell(5);
        const cellActions = row.insertCell(6);

        // Set the cell values to the corresponding meal data
        cellIndex.textContent = index + 1;
        cellMealName.textContent = mealData.mealName;
        cellAddedOn.textContent = mealData.addedOn;

        cellTimeEaten.textContent = mealData.timeEaten;

        // Calculate total energy and build comma-separated list of ingredients
        let totalEnergy = 0;
        let ingredients = [];
        mealData.ingredients.forEach((ingredient) => {
            if (ingredient.name.toLowerCase() !== "total") {
                totalEnergy += parseFloat(ingredient.energy);
                ingredients.push(ingredient);
            }
        });

        // Set cell values for ingredients and total energy
        cellIngredients.textContent = ingredients.length;
        cellTotalEnergy.textContent = totalEnergy.toFixed(2);

        // Add edit and delete buttons to the actions cell
        const editButton = document.createElement('button');
        editButton.classList.add('editBtn');
        editButton.addEventListener('click', () => {
            // Handle edit action
            openEditModal(index);
        });
        const editIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        editIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        editIcon.setAttribute('viewBox', '0 0 24 24');
        editIcon.setAttribute('fill', 'currentColor');
        editIcon.setAttribute('width', '20');
        editIcon.setAttribute('height', '20');
        editIcon.classList.add('w-6', 'h-6');
        editIcon.innerHTML = `
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
        `;
        editButton.appendChild(editIcon);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('deleteBtn');
        deleteButton.addEventListener('click', () => {
            // Handle delete action
            deleteItem(index);
        });
        const deleteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        deleteIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        deleteIcon.setAttribute('viewBox', '0 0 24 24');
        deleteIcon.setAttribute('fill', 'currentColor');
        deleteIcon.setAttribute('width', '20');
        deleteIcon.setAttribute('height', '20');
        deleteIcon.classList.add('w-6', 'h-6');
        deleteIcon.innerHTML = `
            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
        `;
        deleteButton.appendChild(deleteIcon);

        cellActions.appendChild(editButton);
        cellActions.appendChild(deleteButton);
    });
}
// Function to delete an item from the table and localStorage
function deleteItem(index) {
    mealDataArray.splice(index, 1);

    let storedData = JSON.parse(localStorage.getItem('mealDataArray'));
    storedData.splice(index, 1);
    localStorage.setItem('mealDataArray', JSON.stringify(storedData));
    displayMealDataInTable(storedData); // Redraw the table with the updated data

}

function openEditModal(index) {
    // Populate modal with meal data
    const mealData = mealDataArray[index];
    document.getElementById('editMealName').value = mealData.mealName;
    document.getElementById('editAddedOn').value = mealData.addedOn;
    document.getElementById('editTimeEaten').value = mealData.timeEaten;
    // You can similarly populate other fields like date

    // Show the modal
    $('#editModal').modal('show');

    // Add event listener to the modal save button
    document.getElementById('saveEditBtn').addEventListener('click', () => {
        // Update meal data in mealDataArray
        mealDataArray[index].mealName = document.getElementById('editMealName').value;
        mealDataArray[index].addedOn = document.getElementById('editAddedOn').value;
        mealDataArray[index].timeEaten = document.getElementById('editTimeEaten').value;
        // You can similarly update other fields like date

        // Update local storage
        localStorage.setItem('mealDataArray', JSON.stringify(mealDataArray));

        // Update the table display
        displayMealDataInTable();

        // Hide the modal
        $('#editModal').modal('hide');
    });
}


function displaySummary() {
    const summaryTable = document.getElementById("summaryTable");
    const totalEnergyElement = document.getElementById("totalEnergy");
    const totalMealsElement = document.getElementById("totalMeals");

    // Calculate total energy and total meals
    let totalEnergy = 0;
    const totalMeals = mealDataArray.length;

    mealDataArray.forEach((mealData) => {
        mealData.ingredients.forEach((ingredient) => {
            totalEnergy += parseInt(ingredient.energy);
        });
    });

    // Update the summary elements
    totalEnergyElement.textContent = totalEnergy;
    totalMealsElement.textContent = totalMeals;
}

function validateForm() {
    // Get form inputs
    const mealNameInput = document.getElementById("mealName");
    const addedOnInput = document.getElementById("addedOn");
    const mealTypeInput = document.getElementById("mealType");
    const quantityInput = document.getElementById("quantity");
    const timeEatenInput = document.getElementById("timeEaten");

    // Perform validation
    if (mealNameInput.value.trim() === "") {
        alert("Please enter meal name.");

        return false;
    }
    if (addedOnInput.value.trim() === "") {
        alert("Please enter added on date.");

        return false;
    }
    if (mealTypeInput.value === "") {
        alert("Please select meal type.");

        return false;
    }
    if (quantityInput.value.trim() === "") {
        alert("Please enter quantity.");
        quantityInput.focus();
        return false;
    }
    if (timeEatenInput.value.trim() === "") {
        alert("Please enter time eaten.");
        timeEatenInput.focus();
        return false;
    }

    // Form is valid
    return true;
}

// Function to handle button clicks and set meal type
function handleButtonClick(event) {
    const mealType = event.currentTarget.dataset.mealType;
    const modal = document.getElementById("exampleModal");
    const mealTypeSelect = document.getElementById("mealType");

    if (mealType) {
        modal.dataset.mealType = mealType;
        mealTypeSelect.value = mealType;
    }
}

// Event listener for button clicks
document.querySelectorAll(".mealCreator-btn button").forEach(function (btn) {
    btn.addEventListener("click", handleButtonClick);
});

document.getElementById("exampleModal").addEventListener("show.bs.modal", function (event) {
    const modal = document.getElementById("exampleModal");
    const mealType = modal.dataset.mealType;
    const mealTypeSelect = document.getElementById("mealType");
    const addedOnInput = document.getElementById("addedOn");

    // Get today's date in the format "YYYY-MM-DD"
    const today = new Date().toISOString().split("T")[0];

    // Set the value of the addedOn input to today's date
    addedOnInput.value = today;
    if (mealType) {
        mealTypeSelect.value = mealType;
    }
});



// Add event listener to the dinner button
document.getElementById('btnDinner').addEventListener('click', () => {
    console.log('dinnerMeals');

    // Filter mealDataArray for dinner meals
    const dinnerMeals = mealDataArray.filter(meal => meal.mealType === 'dinner');
    if (dinnerMeals.length === 0) {
        document.getElementById('NoName').style.display = 'block'
    } else {
        document.getElementById('NoName').style.display = 'none'

    }
    // Open modal with dinner data
    openMealTrackerModal(dinnerMeals);
});

// Add event listener to the liquid button
document.getElementById('btnLiquid').addEventListener('click', () => {
    // Filter mealDataArray for liquid meals
    const liquidMeals = mealDataArray.filter(meal => meal.mealType === 'liquid');
    if (liquidMeals.length === 0) {
        document.getElementById('NoName').style.display = 'block'
    } else {
        document.getElementById('NoName').style.display = 'none'

    }
    // Open modal with liquid data
    openMealTrackerModal(liquidMeals);
});

function openMealTrackerModal(meals) {
    // Show the modal
    $('#mealTrackerModal').modal('show');
    const mealNamesDiv = document.getElementById('mealnames');

    meals.forEach(meal => {
        if (meal.mealName != null) {
            const pTag = document.createElement('p');
            pTag.textContent = meal.mealName;
            // Add event listener to each p element
            pTag.addEventListener('click', function () {
                // Remove the background color from all p elements
                mealNamesDiv.querySelectorAll('p').forEach(p => {
                    p.style.backgroundColor = '';
                });
                // Highlight the clicked p element
                pTag.style.backgroundColor = 'lightblue';
            });
            mealNamesDiv.appendChild(pTag);
        }
    });

}
let mealTrackerDataArray = [];
document.addEventListener("DOMContentLoaded", function () {

    // Check if data exists in local storage
    if (localStorage.getItem("mealTrackerData")) {
        mealTrackerDataArray = JSON.parse(localStorage.getItem("mealTrackerData"));

        displayMealTrackerData();

    }
    document.getElementById('addMealTreckerItem').addEventListener('click', () => {
        let mealName = document.getElementById('mealnames').querySelector('p[style="background-color: lightblue;"]').textContent;
        let dateOfConsumption = document.getElementById('dateOfConsumption').value;
        let timeOfConsumption = document.getElementById('timeOfConsumption').value;
        let consumptionWigth = document.getElementById('consumptionWigth').value;

        const selectedMeal = mealDataArray.find(meal => meal.mealName === mealName);
        const selectedIngredients = mealDataArray.find(meal => meal.mealName === mealName);
        const energy = selectedMeal.ingredients.find(ingredient => ingredient.name.toLowerCase() === 'total').energy;



        // Create an object for the meal tracker data
        const mealTrackerData = {
            mealName: mealName,
            mealType: selectedMeal.mealType,
            addedOn: dateOfConsumption + ' ' + timeOfConsumption,
            consumptionWigth: consumptionWigth,
            energy: energy,
            ingredients: selectedIngredients,
            percentage1: '30g',
            percentage2: '12g',
            percentage3: '2mg',
            percentage4: '15'
        };

        // Push the meal tracker data to the mealTrackerData array
        mealTrackerDataArray.push(mealTrackerData);

        // Store the updated mealTrackerData array in local storage
        localStorage.setItem('mealTrackerData', JSON.stringify(mealTrackerDataArray));
        document.getElementById('mealTrackerDataForm').reset()
        mealName = '';
        dateOfConsumption = '';
        timeOfConsumption = '';
        consumptionWigth = '';
        const mealNamesDiv = document.getElementById('mealnames');
        if (mealNamesDiv) {
            mealNamesDiv.innerHTML = '';
        }
        // Update the table display

        displayMealTrackerData();
        updateNutriArray(mealTrackerDataArray);
        updateNutritionDashboard();


    });
})



function displayMealTrackerData() {
    const tableBody = document.getElementById("mealTrackerDataBody");
    // Clear existing table data
    tableBody.innerHTML = "";
    if (localStorage.getItem("mealTrackerData")) {
        mealTrackerDataArray = JSON.parse(localStorage.getItem("mealTrackerData"));

    }

    if (mealTrackerDataArray.length > 0) {
        document.getElementById("mealTrackerDataTable").style.display = "table";

    } else {
        document.getElementById("mealTrackerDataTable").style.display = "none";


    }
    // Iterate through each meal tracker data in the mealTrackerDataArray
    mealTrackerDataArray.forEach((mealTrackerData, index) => {
        // Create a new row for each meal tracker data
        const row = tableBody.insertRow();

        // Add cells for each meal tracker property
        const cellMealSource = row.insertCell(0);
        const cellMealType = row.insertCell(1);
        const cellAddedOn = row.insertCell(2);
        const cellWeightEnergy = row.insertCell(3);

        const cellPercentage = row.insertCell(4);
        const cellActions = row.insertCell(5);

        // Set the cell values to the corresponding meal tracker data
        cellMealSource.textContent = mealTrackerData.mealName;
        cellMealType.textContent = mealTrackerData.mealType;
        cellAddedOn.textContent = mealTrackerData.addedOn;
        cellWeightEnergy.textContent = `${mealTrackerData.consumptionWigth} g / ${mealTrackerData.energy} kJ`;

        // Create p tags with different class names for static percentage values
        const percentageTags = document.createElement('div');
        percentageTags.innerHTML = `
            <p class="percentage-tag">${mealTrackerData.percentage1}</p>
            <p class="percentage-tag">${mealTrackerData.percentage2}</p>
            <p class="percentage-tag">${mealTrackerData.percentage3}</p>
            <p class="percentage-tag">${mealTrackerData.percentage4}</p>
        `;
        cellPercentage.appendChild(percentageTags);

        // Add edit and delete buttons to the actions cell
        const editButton = document.createElement('button');
        editButton.classList.add('editBtn');
        editButton.addEventListener('click', () => {
            // Handle edit action
            openEditMealTrackerModal(index);
        });
        const editIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        editIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        editIcon.setAttribute('viewBox', '0 0 24 24');
        editIcon.setAttribute('fill', 'currentColor');
        editIcon.setAttribute('width', '20');
        editIcon.setAttribute('height', '20');
        editIcon.classList.add('w-6', 'h-6');
        editIcon.innerHTML = `
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"></path>
        `;
        editButton.appendChild(editIcon);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('deleteBtn');
        deleteButton.addEventListener('click', () => {
            // Handle delete action

            deleteMealTrackerData(index);
        });
        const deleteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        deleteIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        deleteIcon.setAttribute('viewBox', '0 0 24 24');
        deleteIcon.setAttribute('fill', 'currentColor');
        deleteIcon.setAttribute('width', '20');
        deleteIcon.setAttribute('height', '20');
        deleteIcon.classList.add('w-6', 'h-6');
        deleteIcon.innerHTML = `
            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd"></path>
        `;
        deleteButton.appendChild(deleteIcon);

        cellActions.appendChild(editButton);
        cellActions.appendChild(deleteButton);
    });

    $('#mealTrackerModal').modal('hide');
}

function deleteMealTrackerData(index) {
    mealTrackerDataArray.splice(index, 1);

    let storedData = JSON.parse(localStorage.getItem('mealTrackerData'));
    storedData.splice(index, 1);
    localStorage.setItem('mealTrackerData', JSON.stringify(storedData));
    displayMealTrackerData(storedData)
    updateNutriArray(storedData);
    updateNutritionDashboard();
}

function updateNutriArray(data) {
    // Clear the existing nutriarray
    nutriarray.length = 0;

    // Iterate through the meal data to update nutriarray

    data.forEach(meal => {
        // Extract the date from the meal
        const mealDate = meal.addedOn.split(' ')[0]; // Assuming the date is in the 'YYYY-MM-DD' format

        // Check if there is already an object in nutriarray with the same date
        const existingObjectIndex = nutriarray.findIndex(obj => obj.date === mealDate);

        // If an object with the same date exists, add the meal data to that object
        if (existingObjectIndex !== -1) {
            nutriarray[existingObjectIndex].meals.push(meal);
        } else {
            // If an object with the same date doesn't exist, create a new object
            nutriarray.push({
                date: mealDate,
                meals: [meal] // Add the meal data as the first item in an array
            });
        }
    });
    // Calculate total nutrient values for each date group in nutriarray
    nutriarray.forEach(nutriObj => {
        // Initialize variables to store the total values
        let totalEnergy = 0;
        let totalFat = 0;
        let totalFiber = 0;
        let totalProtein = 0;

        // Iterate through the meals array for each nutriObj
        nutriObj.meals.forEach(meal => {
            // Extract the total object from the ingredients array for each meal
            const totalObject = meal.ingredients.ingredients.find(ingredient => ingredient.name.toLowerCase() === 'total');

            // Add the values from the total object to the respective totals
            totalEnergy += parseFloat(totalObject.energy);
            totalFat += parseFloat(totalObject.fat);
            totalFiber += parseFloat(totalObject.fiber);
            totalProtein += parseFloat(totalObject.protein);
        });

        // Update the nutriObj with the total values
        nutriObj.totalNutrients = {
            energy: totalEnergy,
            fat: totalFat,
            fiber: totalFiber,
            protein: totalProtein
        };
    });

    // Store nutriarray data in local storage
    localStorage.setItem('nutriarray', JSON.stringify(nutriarray));

    // Display the nutriarray data in the table
    displayNutriDataInTable(nutriarray);


}
let nutriarray = [];

document.addEventListener("DOMContentLoaded", function () {

    // Initialize an empty array to store the grouped data
    const nutriarray = [];

    // Iterate through the mealTrackerDataArray
    mealTrackerDataArray.forEach(meal => {
        // Extract the date from the meal
        const mealDate = meal.addedOn.split(' ')[0]; // Assuming the date is in the 'YYYY-MM-DD' format

        // Check if there is already an object in nutriarray with the same date
        const existingObjectIndex = nutriarray.findIndex(obj => obj.date === mealDate);

        // If an object with the same date exists, add the meal data to that object
        if (existingObjectIndex !== -1) {
            nutriarray[existingObjectIndex].meals.push(meal);
        } else {
            // If an object with the same date doesn't exist, create a new object
            nutriarray.push({
                date: mealDate,
                meals: [meal] // Add the meal data as the first item in an array
            });
        }
    });

    // Calculate total nutrient values for each date group in nutriarray
    nutriarray.forEach(nutriObj => {
        // Initialize variables to store the total values
        let totalEnergy = 0;
        let totalFat = 0;
        let totalFiber = 0;
        let totalProtein = 0;

        // Iterate through the meals array for each nutriObj
        nutriObj.meals.forEach(meal => {
            // Extract the total object from the ingredients array for each meal
            const totalObject = meal.ingredients.ingredients.find(ingredient => ingredient.name.toLowerCase() === 'total');

            // Add the values from the total object to the respective totals
            totalEnergy += parseFloat(totalObject.energy);
            totalFat += parseFloat(totalObject.fat);
            totalFiber += parseFloat(totalObject.fiber);
            totalProtein += parseFloat(totalObject.protein);
        });

        // Update the nutriObj with the total values
        nutriObj.totalNutrients = {
            energy: totalEnergy,
            fat: totalFat,
            fiber: totalFiber,
            protein: totalProtein
        };
    });

    // Store nutriarray data in local storage
    localStorage.setItem('nutriarray', JSON.stringify(nutriarray));

    // Display the nutriarray data in the table
    displayNutriDataInTable(nutriarray);
    updateNutritionDashboard();
});

function displayNutriDataInTable(nutriarray) {
    //    Reference to the table body
    const nutriDataBody = document.getElementById('nutriDataBody');

    // Clear previous content in the table body
    nutriDataBody.innerHTML = '';

    // Iterate through the nutriarray to populate the table
    nutriarray.forEach(nutriObj => {
        // Create a new table row
        const row = document.createElement('tr');
        const liquidMeals = nutriObj.meals.filter(meal => meal.mealType === 'liquid');

        // Calculate water value (consumption weight divided by 1000) for liquid meals
        const water = liquidMeals.reduce((total, meal) => total + (parseFloat(meal.consumptionWigth) / 1000), 0);

        // Populate the row with data
        row.innerHTML = `
        <td>${nutriObj.date}</td>
        <td>${nutriObj.meals.length} Meals</td>
        <td>${water.toFixed(2)} L</td>
        <td>${nutriObj.totalNutrients.energy.toFixed(2)} Kcal</td>
        <td>${nutriObj.totalNutrients.protein.toFixed(2)} </td>
        <td>${nutriObj.totalNutrients.fat.toFixed(2)}</td>
        <td>${nutriObj.totalNutrients.fiber.toFixed(2)}</td>
    `;

        // Append the row to the table body
        nutriDataBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Load meal data from local storage
    updateNutritionDashboard()
})


function updateNutritionDashboard() {
    let nutriarray = [];
    if (localStorage.getItem("nutriarray")) {
        nutriarray = JSON.parse(localStorage.getItem("nutriarray"));
        displayMealTrackerData();
    }



    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Find today's data from nutriarray
    let todayData = nutriarray.find(obj => obj.date === today);
    if (!todayData) {
        // Sort the nutriarray by date in descending order
        nutriarray.sort((a, b) => (a.date > b.date ? -1 : 1));

        // Find the nearest available day data
        for (const data of nutriarray) {
            if (data.date > today) {
                todayData = data;
                break;
            }
        }
    }

    // If no suitable data is found, set todayData to undefined
    if (!todayData) {
        todayData = undefined;
    }
    if (typeof todayData === 'undefined') {
        document.getElementById('nutritionDashboardToDay').textContent = '0';
        document.getElementById('nutritionDashboardEnargy').textContent = '0.00 kcal';
        document.getElementById('nutritionDashboardWater').textContent = '0.00 L';
        document.getElementById('nutritionDashboardProtion').textContent = '0.00 g';
    }
    // If today's data is found, update the nutrition dashboard
    if (todayData) {
        const {
            meals,
            totalNutrients
        } = todayData;
        // Calculate total energy, water, and protein for today
        let totalEnergyToday = totalNutrients.energy;
        let totalWaterToday = 0;
        let totalProteinToday = totalNutrients.protein;
        meals.forEach(meal => {
            if (meal.mealType.toLowerCase() === 'liquid') {
                totalWaterToday += parseFloat(meal.consumptionWigth) / 1000; // Assuming water is measured in grams
            }
        });


        // Update the nutrition dashboard elements with today's data
        document.getElementById('nutritionDashboardToDay').textContent = meals.length;
        document.getElementById('nutritionDashboardEnargy').textContent = totalEnergyToday.toFixed(2) + 'kcal';
        document.getElementById('nutritionDashboardWater').textContent = totalWaterToday.toFixed(2) + 'L';
        document.getElementById('nutritionDashboardProtion').textContent = totalProteinToday.toFixed(2) + 'g';



    }
}
document.addEventListener("DOMContentLoaded", function () {
    populateFoodNames()
})
async function populateFoodNames() {
    const foodItems = await hentMåltiderFraAPI();
    const foodNameSelect = document.getElementById("foodNameSelect");

    if (foodItems && foodItems.length > 0) {

        foodItems.forEach((foodItem) => {
            const option = document.createElement("option");
            option.value = foodItem.foodID; // Set the value to the food ID
            option.textContent = foodItem.foodName;
            foodNameSelect.appendChild(option);
        });
    }
}
async function displayfoodNameData(foodID) {

    foodID.forEach((item) => {

        const energy = +item.energy.replace(",", ".");
        const protein = +item.protein.replace(",", ".");
        const fat = +item.fat.replace(",", ".");
        const fiber = +item.fiber.replace(",", ".");
        if (item) {
            const dataHTML = `
                <div class="foodInspector-data-item">
                    <p>Energy (kcal):</p>
                    <p>${energy.toFixed(2)} kcal</p>
                </div>
                <div class="foodInspector-data-item">
                    <p>Protein:</p>
                    <p>${protein.toFixed(2)} g</p>
                </div>
                <div class="foodInspector-data-item">
                    <p>Dietary Fiber:</p>
                    <p>${fiber.toFixed(2)} g</p>
                </div>
                <div class="foodInspector-data-item">
                    <p>Fat:</p>
                    <p>${fat.toFixed(2)} g</p>
                </div>
          
            `;
            foodInspectorData.innerHTML = dataHTML;
        } else {
            foodInspectorData.innerHTML = "<p>No data available for the selected food item.</p>";
        }
    })

}
document.getElementById("foodNameSelect").addEventListener("change", async function () {
    // const selectedFoodID = this.value;
    // if (selectedFoodID) {
    //     displayFoodData(selectedFoodID);
    // } else {
    //     // Clear data if no food name is selected
    //     document.getElementById("foodInspectorData").innerHTML = "";
    // }

    try {
        // Get the selected food ID from the select element
        const selectedFoodID = document.getElementById("foodNameSelect").value;

        if (!selectedFoodID) {
            console.error("No food name selected.");
            return;
        }
        const dataHTML = `
        <div class="foodInspector-data-item">
            <p>Energy (kcal):</p>
            <p>0.00 kcal</p>
        </div>
        <div class="foodInspector-data-item">
            <p>Protein:</p>
            <p>0.00 g</p>
        </div>
        <div class="foodInspector-data-item">
            <p>Dietary Fiber:</p>
            <p>0.00 g</p>
        </div>
        <div class="foodInspector-data-item">
            <p>Fat:</p>
            <p>0.00 g</p>
        </div>
  
    `;
        foodInspectorData.innerHTML = dataHTML;
        document.getElementById("foodInspector-lodar").style.display = "block";
        document.getElementById("foodInspectorImage").style.display = "none";


        // Fetch data for all ingredients
        const fetchedData = await Promise.all([
            gotData(selectedFoodID, 1030),
            gotData(selectedFoodID, 1110),
            gotData(selectedFoodID, 1310),
            gotData(selectedFoodID, 1240)
        ]);

        // Create an object with the desired structure for each ingredient and push it into ingredientsData array
        ingredientsData.push({
            id: ingredientsData.length,
            foodName: selsectFoodName, // Use the selected food name
            quantity: quantityValue,
            energy: fetchedData[0][0].resVal,
            protein: fetchedData[1][0].resVal,
            fat: fetchedData[2][0].resVal,
            fiber: fetchedData[3][0].resVal,
        });


        document.getElementById("foodInspector-lodar").style.display = "none";
        document.getElementById("foodInspectorImage").textContent = "No Image Found"
        document.getElementById("foodInspectorImage").style.display = "block";

        // Show data in the table
        displayfoodNameData(ingredientsData);
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
});