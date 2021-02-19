const getImageUrl = (imageName: string): string => {
  return `http://localhost:3333/uploads/${imageName}`;
};

export default getImageUrl;
