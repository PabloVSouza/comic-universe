import { SimpleImg } from "react-simple-img";

const Image = ({ placeholder, pure, src, svg, ...props }) => {
  let Comp = SimpleImg;
  if (pure) Comp = "img";
  if (svg) Comp = "div";

  const iconStyle = {
    WebkitMaskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskOrigin: "content-box",
  };

  return (
    !!src && (
      <Comp
        key={src}
        placeholder={placeholder || (!pure ? false : "")}
        src={src}
        {...props}
        style={!!svg ? iconStyle : {}}
      />
    )
  );
};

export default Image;
