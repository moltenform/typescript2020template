
import checker from 'vite-plugin-checker'

export default {
  // config options
  build: {
    sourcemap: true,
  },
   server: {
        hmr: false
    },
   plugins: [!process.env.VITEST ? checker({ typescript: true }) : undefined],
}


