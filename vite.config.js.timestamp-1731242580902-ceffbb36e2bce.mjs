// vite.config.js
import { defineConfig } from "file:///D:/Tasktigers-devops/user-tasktigers-fe/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Tasktigers-devops/user-tasktigers-fe/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { viteStaticCopy } from "file:///D:/Tasktigers-devops/user-tasktigers-fe/node_modules/vite-plugin-static-copy/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "web.config",
          // Specify the web.config file
          dest: "."
          // Copy it to the root of the dist folder
        }
      ]
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  assetsInclude: ["**/*.config"]
  // Treat .config files as
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxUYXNrdGlnZXJzLWRldm9wc1xcXFx1c2VyLXRhc2t0aWdlcnMtZmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFRhc2t0aWdlcnMtZGV2b3BzXFxcXHVzZXItdGFza3RpZ2Vycy1mZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovVGFza3RpZ2Vycy1kZXZvcHMvdXNlci10YXNrdGlnZXJzLWZlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5J1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgdml0ZVN0YXRpY0NvcHkoe1xyXG4gICAgICB0YXJnZXRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc3JjOiAnd2ViLmNvbmZpZycsICAvLyBTcGVjaWZ5IHRoZSB3ZWIuY29uZmlnIGZpbGVcclxuICAgICAgICAgIGRlc3Q6ICcuJyAgLy8gQ29weSBpdCB0byB0aGUgcm9vdCBvZiB0aGUgZGlzdCBmb2xkZXJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0pXHJcbiAgXSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICB9LFxyXG4gIGFzc2V0c0luY2x1ZGU6IFsnKiovKi5jb25maWcnXSwgIC8vIFRyZWF0IC5jb25maWcgZmlsZXMgYXMgYXNzZXRzXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlMsU0FBUyxvQkFBb0I7QUFDMVUsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsc0JBQXNCO0FBRy9CLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLGVBQWU7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxLQUFLO0FBQUE7QUFBQSxVQUNMLE1BQU07QUFBQTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLGVBQWUsQ0FBQyxhQUFhO0FBQUE7QUFDL0IsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
