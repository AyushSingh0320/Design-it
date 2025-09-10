import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative">
      {/* Hero section */}
      <div className="relative">
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
            DesignerHub
          </h1>
          <p className="mt-6 text-xl text-gray-200 max-w-3xl drop-shadow-md">
            Showcase your design portfolio, connect with other designers, and collaborate on exciting projects.
          </p>
          <div className="mt-10">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600/90 hover:bg-primary-700 backdrop-blur-sm shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-400 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl drop-shadow-lg">
              Everything you need to showcase your work
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-200 lg:mx-auto drop-shadow-md">
              DesignerHub provides all the tools you need to build your online presence and connect with other designers.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-white">Portfolio Management</h3>
                  <p className="mt-2 text-base text-gray-200">
                    Create and manage your portfolio with ease. Showcase your best work with high-quality images and detailed descriptions.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-white">Collaboration</h3>
                  <p className="mt-2 text-base text-gray-200">
                    Connect with other designers and collaborate on projects. Share ideas and get feedback from the community.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-white">Discover</h3>
                  <p className="mt-2 text-base text-gray-200">
                    Explore amazing designs from talented creators. Get inspired and find new opportunities.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-white">Customization</h3>
                  <p className="mt-2 text-base text-gray-200">
                    Personalize your profile and portfolio to match your unique style and brand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     {/* footer section */}
     
      <div className="sm:px-36 px-6 py-2.5 flex flex-col gap-5 justify-between md:flex-row text-secondary  ">

      <div className="flex flex-col items-center font-semibold text-[17px] text-white">
        <p>Designed & Developed by</p>
        <div className="flex gap-1 items-center">
          <p>&nbsp;Ayush Singh</p>  <p>2025</p>
        </div>
      </div>

      <div className="gap-5 font-semibold tracking-wide flex flex-col md:flex-row items-center">
        <div className="group flex flex-col justify-center cursor-pointer text-white  hover:text-blue-600">
          <a href="https://github.com/Ayushsingh0320" target="_blank" rel="noreferrer">GITHUB</a>
          <div className="h-[1.5px] w-auto bg-secondary opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"></div>
        </div>
        <div className="group flex flex-col justify-center cursor-pointer text-white hover:text-blue-600 ">
          <a href="https://www.linkedin.com/in/ayush-singh-28a292369/" target="_blank" rel="noreferrer">LINKEDIN</a>
          <div className="h-[1.5px] w-auto bg-secondary opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"></div>
        </div>
      </div>


    </div>

    </div>
  );
};

export default Home; 