import { SimpleImg } from "react-simple-img";

const Image = ({ placeholder, pure, src, ...props }) => {
  const Comp = !pure ? SimpleImg : "img";
  return (
    !!src && (
      <Comp
        key={src}
        placeholder={placeholder || (!pure ? false : "")}
        src={src}
        {...props}
      />
    )
  );
};

export default Image;
