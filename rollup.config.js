import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es';

export default {
  input: 'qrrecode.js',
  output: {
    file: 'qrrecode.min.js',
    format: 'umd',
    name: 'QRRecode',
  },
  plugins: [
    babel({
        presets: [['es2015', { modules: false }]],
        plugins: ['external-helpers'],
    }),
    uglify(),
  ],
};