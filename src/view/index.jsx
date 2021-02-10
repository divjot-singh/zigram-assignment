import React, { useState, useEffect } from "react";
import "./index.scss";
import NetworkUtil from "../utils/networkutil";
import DrinkCard from "./components/drinkCard";
import SelectSearch, { fuzzySearch } from "react-select-search";
import "react-select-search/style.css";
import { useDebounce } from "use-debounce";
import Loader from "react-loader-spinner";

const Home = props => {
  let [categories, setCategories] = useState([]),
    [ingredients, setIngredients] = useState([]),
    [selectedCategory, setSelectedCategory] = useState(""),
    [selectedIngredient, setSelectedIngredient] = useState(""),
    [searchText, setSearchText] = useState(""),
    [drinks, setDrinks] = useState([]),
    [searchString] = useDebounce(searchText, 1000),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!categories.length) {
      fetchCategories();
    }
    if (!ingredients.length) {
      fetchIngredients();
    }
  });
  const fetchCategories = async () => {
    let categories = await NetworkUtil.get(
      "https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list"
    );

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
    let ingredients = await NetworkUtil.get(
      "https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list"
    );

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
  if (loading) {
    return (
      <div className="container loader">
        <Loader
          type="Puff"
          color="#00BFFF"
          height={100}
          width={100}
          timeout={3000} //3 secs
        />
      </div>
    );
  }
  return (
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
            return <DrinkCard drink={drink} key={drink.iDrink} />;
          })
        ) : (
          <div className="no-drinks">No results found</div>
        )}
      </div>
    </div>
  );
};

export default Home;
