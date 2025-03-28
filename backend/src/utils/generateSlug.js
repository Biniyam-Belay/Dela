const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')      // Replace spaces with -
      .replace(/[^\w\-]+/g, '')  // Remove all non-word chars except -
      .replace(/\-\-+/g, '-')    // Replace multiple - with single -
      // Optionally add a unique suffix if worried about collisions,
      // but we handle collision checks in the controllers for now.
      // .concat('-' + Date.now()); // Example suffix
  };
  
  export default generateSlug;