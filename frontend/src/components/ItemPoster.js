import React from "react";

const ItemPoster = ({ poster, alt }) => {
  return <img src={poster} alt={alt} className="img-fluid" />;
};

export default ItemPoster;
