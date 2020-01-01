import "./ItemsCarrousel.css";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import React from "react";
import { FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";
import Slider from "react-slick";

import ListItem from "./ListItem";

class ItemsCarrousel extends React.Component {
  _moveLeft() {
    this.slider.slickPrev();
  }

  _moveRight() {
    this.slider.slickNext();
  }

  _beforeChange(current, next) {
    const { loading, hasNextPage, loadNextPage } = this.props;
    if (current === next && current > 0 && hasNextPage && !loading) {
      loadNextPage(() => setTimeout(() => this.slider.slickNext(), 1000));
    }
  }

  render() {
    const { items, loading } = this.props;
    if (items.length === 0) {
      return null;
    }

    const settings = {
      dots: false,
      arrows: false,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      beforeChange: this._beforeChange.bind(this),
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    };

    return (
      <div className="items-carrousel">
        <h2 className="carrousel-title">Pending to watch</h2>
        <div
          className="carrousel-arrow-button carrousel-left-button"
          onClick={this._moveLeft.bind(this)}
        >
          <FaChevronLeft />
        </div>
        <Slider {...settings} ref={(c) => (this.slider = c)}>
          {items.map((item, index) => (
            <div key={index}>
              <ListItem item={item} />
            </div>
          ))}
        </Slider>
        <div
          className="carrousel-arrow-button carrousel-right-button"
          onClick={this._moveRight.bind(this)}
        >
          {loading ? <FaSpinner className="icon-spin" /> : <FaChevronRight />}
        </div>
      </div>
    );
  }
}

export default ItemsCarrousel;
