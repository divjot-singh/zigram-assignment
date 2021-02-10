import React, { useState, useEffect, Fragment as F } from "react";
import "./index.scss";
import NetworkUtil from "../utils/networkutil";
import DrinkCard from "./components/drinkCard";
import SelectSearch, { fuzzySearch } from "react-select-search";
import "react-select-search/style.css";
import { useDebounce } from "use-debounce";
import LoadingOverlay from "react-loading-overlay";
import { Dialog } from "@material-ui/core";
import BounceLoader from "react-spinners/BounceLoader";
import { FaTimes } from "react-icons/fa";

const Home = props => {
  let [categories, setCategories] = useState([]),
    [ingredients, setIngredients] = useState([]),
    [selectedCategory, setSelectedCategory] = useState(""),
    [selectedIngredient, setSelectedIngredient] = useState(""),
    [searchText, setSearchText] = useState(""),
    [drinks, setDrinks] = useState([]),
    [searchString] = useDebounce(searchText, 1000),
    [loading, setLoading] = useState(false),
    [selectedDrink, setSelectedDrink] = useState({});
  useEffect(() => {
    if (!categories.length) {
      fetchCategories();
    }
    if (!ingredients.length) {
      fetchIngredients();
    }
  });
  const fetchCategories = async () => {
    setLoading(true);
    let categories = await NetworkUtil.get(
      "https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list"
    );
    setLoading(false);
    if (categories.drinks && categories.drinks.length) {
      setCategories(categories.drinks);
      let selectedCategory = categories.drinks[0].strCategory
        .split(" ")
        .join("_");
      setSelectedCategory(selectedCategory);
      filterDrinks(selectedCategory);
    }
  };
  const filterDrinks = async (category, ingredient) => {
    setLoading(true);
    let url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?${
      category ? "c=" + category.split(" ").join("_") + "&" : ""
    }${ingredient ? "i=" + ingredient.split(" ").join("_") + "&" : ""}`;
    let drinks = await NetworkUtil.get(url);
    setLoading(false);
    if (drinks.drinks) {
      setDrinks(drinks.drinks);
    } else {
      setDrinks([]);
    }
  };
  const fetchIngredients = async () => {
    setLoading(true);
    let ingredients = await NetworkUtil.get(
      "https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list"
    );
    setLoading(false);
    if (ingredients.drinks) {
      setIngredients(ingredients.drinks);
    }
  };
  const onCategoryChange = value => {
    setSelectedCategory(value);
    setSelectedIngredient("");
    setSearchText("");
    filterDrinks(value, "");
  };
  const onIngredientChange = value => {
    setSelectedIngredient(value);
    setSelectedCategory("");
    setSearchText("");
    filterDrinks("", value);
  };
  const onSearchTextChange = e => {
    let value = e.target.value;
    setSearchText(value);
    setSelectedIngredient("");
    setSelectedCategory("");
  };
  useEffect(() => {
    if (searchText === searchString && searchString.trim().length > 0)
      searchDrinksByName(searchString);
  }, [searchString]);
  const searchDrinksByName = async string => {
    let url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${string}`;
    setLoading(true);
    let drinks = await NetworkUtil.get(url);
    setLoading(false);
    if (drinks.drinks) {
      setDrinks(drinks.drinks);
    } else {
      setDrinks([]);
    }
  };

  const onDrinkClick = async drinkId => {
    setLoading(true);
    let url = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`;
    let details = await NetworkUtil.get(url);
    setLoading(false);
    if (details && details.drinks && details.drinks.length) {
      setSelectedDrink(details.drinks[0]);
    }
  };
  const getIngredients = selectedDrink => {
    let ingredients = [];
    for (let key in selectedDrink) {
      if (key.indexOf("strIngredient") > -1) {
        ingredients.push(selectedDrink[key]);
      }
    }
    if (ingredients.length)
      return (
        <div className="ingredients">
          <div className="label">Ingredients: </div>
          <div className="ingredient-details">
            {ingredients.map(ingredient => (
              <div>{ingredient}</div>
            ))}
          </div>
        </div>
      );
    else return "";
  };
  return (
    <LoadingOverlay
      className="loading-overlay"
      active={loading}
      spinner={<BounceLoader className="loader" />}
    >
      <Dialog
        maxHeight={"80vh"}
        maxWidth={"300px"}
        open={Object.keys(selectedDrink).length}
        className="drink-details-dialog"
        // onClose={() => {
        //   setSelectedDrink({});
        // }}
        aria-labelledby="max-width-dialog-title"
      >
        <div
          className="cancel-icon"
          onClick={() => {
            setSelectedDrink({});
          }}
        >
          <FaTimes />
        </div>
        <div className="drink-details">
          <div className="header">
            <img src={selectedDrink.strDrinkThumb} className="drink-thumb" />
          </div>
          <div className="drink-name">{selectedDrink.strDrink}</div>
          <div className="content">
            <div className="row">
              <div className="label">Category: </div>
              <span className="details">{selectedDrink.strCategory}</span>
            </div>
            <div className="row">
              <div className="label">Glass: </div>
              <span className="details">{selectedDrink.strGlass}</span>
            </div>
            <div className="row">
              <div className="label">Type: </div>
              <span className="details">{selectedDrink.strAlcoholic}</span>
            </div>
            <div className="row">
              <div className="label">Category: </div>
              <span className="details">{selectedDrink.strCategory}</span>
            </div>
          </div>
          {getIngredients(selectedDrink)}
          <div className="instructions">
            <div className="label">Instructions:</div>
            <div className="details">{selectedDrink.strInstructions}</div>
          </div>
        </div>
      </Dialog>
      <div className="container">
        <div className="category-selector">
          <SelectSearch
            options={categories.map(category => {
              return {
                name: category.strCategory,
                value: category.strCategory.split(" ").join("_")
              };
            })}
            search
            filterOptions={fuzzySearch}
            value={selectedCategory}
            onChange={onCategoryChange}
            name="categories"
            placeholder="Choose a category"
          />
          <SelectSearch
            options={ingredients.map(ingredient => {
              return {
                name: ingredient.strIngredient1,
                value: ingredient.strIngredient1.split(" ").join("_")
              };
            })}
            search
            filterOptions={fuzzySearch}
            value={selectedIngredient}
            onChange={onIngredientChange}
            name="ingredients"
            placeholder="Choose an ingredient"
          />
          <input
            className="plain-input select-search__input"
            value={searchText}
            onChange={onSearchTextChange}
            placeholder="Search via name"
          ></input>
        </div>
        <div className="drink-list">
          {drinks.length ? (
            drinks.map(drink => {
              return (
                <DrinkCard
                  drink={drink}
                  key={drink.iDrink}
                  onDrinkClick={onDrinkClick}
                />
              );
            })
          ) : (
            <div className="no-drinks">No results found</div>
          )}
        </div>
      </div>
    </LoadingOverlay>
  );
};

export default Home;
