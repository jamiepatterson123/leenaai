
export const AuthLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-sm text-gray-500">Loading...</p>
    </div>
  );
};
