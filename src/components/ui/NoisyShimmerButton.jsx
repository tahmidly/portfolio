import { ShimmerButton } from "./shimmer-button";
import "./NoisyShimmerButton.css";

export default function NoisyShimmerButton({
  children,
  className = "",
  ...props
}) {
  return (
    <ShimmerButton
      className={`btn-shimmer-noise ${className}`.trim()}
      shimmerColor="#1bccfe"
      shimmerSize="0.06em"
      shimmerDuration="2.8s"
      borderRadius="100px"
      background="#0b0b0b"
      {...props}
    >
      {children}
    </ShimmerButton>
  );
}
