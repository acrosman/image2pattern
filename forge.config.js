module.exports = {
  packagerConfig: {
    name: 'image2pattern',
    appBundleId: 'com.electron.image2pattern',
    appCategoryType: 'public.app-category.utilities',
    // Skip local build output, generated images, and tests.
    ignore: [/^\/(dist|images|outputs|test|tests)(\/|$)/],
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32', 'linux'],
    },
  ],
};
