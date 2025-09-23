import { useEffect, useRef } from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
};

export default function AutoGrowTextArea({ minRows = 3, className = "", ...props }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const adjust = () => {
    const el = ref.current;
    if (!el) return;
    // Prevent sideways growth
    el.style.width = "100%";
    el.style.overflowX = "hidden";
    el.style.whiteSpace = "pre-wrap";
    el.style.wordBreak = "break-word";
    // Vertical auto-size
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    adjust();
  }, [props.value]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      {...props}
      className={["w-full resize-y overflow-hidden", className].join(" ")}
      onInput={(e) => {
        props.onInput?.(e);
        adjust();
      }}
    />
  );
}
