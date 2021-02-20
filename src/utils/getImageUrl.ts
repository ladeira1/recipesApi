const getImageUrl = (imageName: string | undefined): string | null => {
  return imageName ? `http://localhost:3333/uploads/${imageName}` : null;
};

export default getImageUrl;
