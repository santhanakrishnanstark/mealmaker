var searchedText = document.querySelector("#searchfoodtxt");
var body = document.querySelector("body");
var mealsContainer = document.querySelector("#meals-container");
var searchResultContainer = document.querySelector("#search-result");
var bgOverlay = document.querySelector(".background-overlay");

var mealModal = document.querySelector("#meal-modal");
var mealIntroDiv = document.querySelector(".meal-intro");
var mealCloseBtn = document.querySelector("#meal-modal-close");
var mealIngredientContainer = document.querySelector(
  ".meal-ingredient-container"
);
var mealInstructionDiv = document.querySelector(".instructions");
var mealProcedureContainer = document.querySelector(".meal-procedure-container");
var mealVideo = document.querySelector("#mealVideo");

var loading = document.querySelector(".loading");

var listOfMeals = [];
var fullMealData = {};

window.addEventListener("scroll", function (e) {
  var visibleSearch = !searchResultContainer.classList.contains("hide");
  if (window.scrollY > 50 || visibleSearch) {
    bgOverlay.style.display = "none";
  } else {
    bgOverlay.style.display = "block";
  }
});
mealsContainer.addEventListener("click", openMealWindow);
mealCloseBtn.addEventListener("click", closeModalWindow);

function getFormData() {
  event.preventDefault();
  var input = search.value;
  if (input.trim()) {
    fetchMeals(input);
  } else {
    alert("please enter meal name you want to try...");
  }
}

async function fetchMeals(input) {
  try {
    loading.classList.toggle("hide");
    var res = await fetch(
      "https://www.themealdb.com/api/json/v1/1/search.php?s=" + input + ""
    );
    var data = await res.json();
    listOfMeals = data.meals;
    search.value = "";
    if (listOfMeals) {
      searchedText.innerText = input + " (" + listOfMeals.length + ")";
      updateSearchResultUI();
    } else {
      alert("No Such Meal...");
      loading.classList.toggle("hide");
    }
  } catch (error) {
    console.log(error);
    loading.classList.toggle("hide");
  }
}

function updateSearchResultUI() {
  searchResultContainer.classList.remove("hide");
  bgOverlay.style.display = "none";
  mealsContainer.innerHTML = "";

  listOfMeals.forEach(function (obj) {
    var card = document.createElement("div");
    var img = document.createElement("img");
    var p = document.createElement("p");
    card.setAttribute("class", "card");
    card.setAttribute("data-meal-id", obj.idMeal);
    img.setAttribute("src", obj.strMealThumb);
    img.setAttribute("alt", "photo of a meal");
    img.setAttribute("class", "meal-img");
    p.setAttribute("class", "meal-name");
    p.innerText = obj.strMeal;
    card.appendChild(img);
    card.appendChild(p);
    mealsContainer.appendChild(card);
  });
  loading.classList.toggle("hide");
}

async function openMealWindow(e) {
  if (e.target.classList.contains("card")) {
    loading.classList.toggle("hide");
    var mealCard = e.target.cloneNode(true);
    mealIntroDiv.appendChild(mealCard);
    var id = e.target.getAttribute("data-meal-id");
    var res = await fetch(
      "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id + ""
    );
    fullMealData = await res.json();
    var ingredients = [];
    for (let i = 1; i <= 20; i++) {
      var ingredientName = fullMealData.meals[0]["strIngredient" + i];
      var ingredientQty = fullMealData.meals[0]["strMeasure" + i];
      var ingredient = {
        name: ingredientName,
        qty: ingredientQty,
        src: "https://www.themealdb.com/images/ingredients/" +
          ingredientName +
          ".png",
      };
      ingredients.push(ingredient);
    }
    var ingredientList = ingredients.filter(function (item) {
      return item.name !== "";
    });

    updateIngredientListUI(ingredientList);

    mealModal.classList.toggle("show");
    body.style.overflow = "hidden";
  }
}

function closeModalWindow() {
  mealIntroDiv.innerHTML = "";
  mealIngredientContainer.innerHTML = "";
  mealInstructionDiv.innerHTML = "";
  mealVideo.innerHTML = "";
  body.style.overflow = "auto";
  mealModal.classList.toggle("show");
}

function updateIngredientListUI(list) {
  mealIngredientContainer.innerHTML = "<h3>Ingredient (" + list.length + ")</h3>";
  list.forEach(function (obj) {
    var card = document.createElement("div");
    var img = document.createElement("img");
    var p = document.createElement("p");
    card.setAttribute("class", "card");
    img.setAttribute("src", obj.src);
    img.setAttribute("alt", "photo of ingredient");
    img.setAttribute("class", "ingredient-img");
    p.setAttribute("class", "ingredient-name");
    p.innerText = obj.name + " - " + obj.qty;
    card.appendChild(img);
    card.appendChild(p);
    mealIngredientContainer.appendChild(card);
  });

  var instructions = fullMealData.meals[0].strInstructions;
  var instructArr = instructions.split(".");
  var ul = document.createElement("ul");
  instructArr.forEach(function (item) {
    var li = document.createElement("li");
    li.innerText = item.trim() + ".";
    ul.appendChild(li);
  });
  mealInstructionDiv.appendChild(ul);

  // create iframe video
  var vidsrc = fullMealData.meals[0].strYoutube;
  var iframe = document.createElement("iframe");
  iframe.setAttribute("width", "560");
  iframe.setAttribute("height", "315");
  iframe.setAttribute("src", vidsrc);
  iframe.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
  mealVideo.appendChild(iframe);

  loading.classList.toggle("hide");
}