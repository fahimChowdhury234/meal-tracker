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
        console.log(data);

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
                    // const filteredItems = foodItems.filter(item => {
                    //     if (item.foodName !== null) {
                    //         if (item.foodName.includes(clickedName)) {
                    //             console.log(item.foodName);
                    //         }
                    //     }
                    // });
                    foodItems.forEach((element) => {
                        if (element.foodName !== null) {
                            if (element.foodName.includes(clickedName)) {
                                selsectFoodID = element.foodID;
                            }
                        }
                    });
                    console.log(`Items with name ${clickedName} or include it:`, foodItems.length);
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
        console.log(ingredientsData);

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
        document.getElementById("mealDataTable").style.display = "table";
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
            console.log(ingredient);
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
        console.log(mealDataArray);

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
            console.log('Edit button clicked for row', index);
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
            console.log('Delete button clicked for row', index);
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