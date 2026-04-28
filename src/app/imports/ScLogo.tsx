import svgPaths from "./svg-hka34i4qsi";

function Container() {
  return (
    <div className="h-[35.569px] relative shrink-0 w-[71.765px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72 36">
        <g id="Container">
          <path d={svgPaths.p2b11cc00} fill="var(--fill-0, white)" fillOpacity="0.5" id="Trazado 5663" />
          <path d={svgPaths.p162de800} fill="var(--fill-0, white)" id="Trazado 5661" />
          <path d={svgPaths.p3b50fa80} fill="var(--fill-0, white)" id="Trazado 5662" />
        </g>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[5.103px] items-end relative shrink-0 w-[80.801px]" data-name="Container">
      <Container />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[35.569px] relative shrink-0 w-[71.765px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72 36">
        <g id="Container">
          <path d={svgPaths.p3968dc00} fill="var(--fill-0, white)" fillOpacity="0.5" id="Trazado 5663" />
          <path d={svgPaths.p162de800} fill="var(--fill-0, white)" id="Trazado 5661" />
          <path d={svgPaths.pfc24280} fill="var(--fill-0, white)" id="Trazado 5662" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[5.103px] items-end justify-end relative w-[80.801px]" data-name="Container">
      <Container2 />
    </div>
  );
}

export default function ScLogo() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="SC Logo">
      <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip px-0 py-[12px] relative shrink-0 size-[96px]" data-name="Big White Logo">
        <Container1 />
        <div className="flex items-center justify-center relative shrink-0">
          <div className="flex-none rotate-[180deg]">
            <Container3 />
          </div>
        </div>
      </div>
    </div>
  );
}