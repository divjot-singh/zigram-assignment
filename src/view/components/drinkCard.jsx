import React from "react";

const DrinkCard = props => {
  let { onDrinkClick, drink = {} } = props,
    { strDrinkThumb, strDrink, idDrink } = drink;
  return (
    <div className="drink-card" onClick={e => onDrinkClick(idDrink)}>
      <img src={strDrinkThumb} className="drink-thumb" />
      <span className="drink-name">{strDrink}</span>
    </div>
  );
};

export default DrinkCard;
