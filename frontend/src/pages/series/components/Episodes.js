import React from "react";
import Slider from "react-slick";

import Episode from "./Episode";

const Episodes = ({ serie, season, updateWatched }) => {
  const settings = {
    arrows: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Slider {...settings}>
      {season.episodes.map((episode, index) => (
        <Episode
          serie={serie}
          season={season}
          episode={episode}
          updateWatched={updateWatched}
          key={index}
        />
      ))}
    </Slider>
  );
};

export default Episodes;
