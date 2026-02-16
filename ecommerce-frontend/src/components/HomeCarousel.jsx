import Slider from "react-slick";

export default function HomeCarousel() {
  const images = [
    "https://images.unsplash.com/photo-1607083206968-13611e3d76db",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="home-carousel w-full px-6 mt-4">
      <Slider {...settings}>
        {images.map((img, i) => (
          <div key={i} className="home-carousel__slide">
            <img
              src={img}
              alt="banner"
              className="home-carousel__img"
              loading="lazy"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
