"use client";
import ClipLoader from "react-spinners/ClipLoader";

const override = {
  display: "block",
  margin: "100px auto",
};

const Spinner = ({ loading }) => {
  return (
    <div className="h-dvh">
      <ClipLoader
        color="#3b82f6"
        loading={loading}
        cssOverride={override}
        size={100}
        aria-label="Loading Spinner"
      />
    </div>
  );
};

export default Spinner;
