import React from 'react';
import { NavLink } from 'react-router-dom';
import ReactGA from 'react-ga4';

interface HeroSectionProps {
  userId: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ userId }) => {
  const handleClick = () => {
    ReactGA.event({ category: 'clicked shop Now', action: userId });
    document.getElementById('productList')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="">
      <div className="mx-[8%] mt-20 mb-2.5 max-w-full px-0 ">
        <div className="grid grid-cols-2 flex gap-8 w-[100%]">
          <div>
            <p className="mb-0 uppercase tracking-wide text-primary-blue">
              Welcome to
            </p>
            <h1 className="capitalize font-bold text-primary-blue text-[3.5rem]">
              VELLO
            </h1>
            <p className="mb-[20px] mt-[20px] text-primary-blue text-[1rem]">
              Hydration for every day
            </p>

            <NavLink to="#">
              <button
                onClick={handleClick}
                className="inline-block uppercase bg-primary-blue text-white py-[0.9rem] px-[1.8rem] rounded-[3px]         
                          transition duration-300 hover:bg-white hover:text-primary-blue
    hover:shadow-[0_1px_4px_rgba(0,0,0,0.16)] hover:scale-[0.96]
    active:shadow-[0_1px_4px_rgba(0,0,0,0.16)] active:scale-[0.96] text-[10px]"
              >
                Shop Now
              </button>
            </NavLink>
          </div>

          <div className="mt-[10px] w-full mr-20 flex justify-right">
            <figure className="relative w-full">
              <span
                aria-hidden
                className="absolute left-[35%] md:left-[33%] top-[1rem] md:top-[-3rem] z-[-1] h-[62%] md:h-[80%] w-[78%] md:w-[55%] bg-primary-blue"
              />
              <img
                src="/images/vello_hero.jpg"
                alt="Vello bottle hero"
                className="md:w-[80%] h-auto"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
