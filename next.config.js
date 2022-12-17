const { NormalModuleReplacementPlugin } = require('webpack'),
  withLess = require('next-with-less'),
  setPWA = require('next-pwa');

const { NODE_ENV } = process.env;

const withPWA = setPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
module.exports = withPWA(
  withLess({
    env:{
      I18NEXT_MOBX_ADDPATH:process.env.I18NEXT_MOBX_ADDPATH,
      LANGUAGE_CONFIG:process.env.LANGUAGE_CONFIG
    },
    webpack5: true,
    webpack: config => {
      config.resolve.fallback = { fs: false };
      config.plugins.push(
        new NormalModuleReplacementPlugin(/^node:/, resource => {
          resource.request = resource.request.replace(/^node:/, '');
        }),
      );
      return config;
    },
    reactStrictMode: true,
  }),
);
