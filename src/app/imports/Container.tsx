import svgPaths from "./svg-ogve5xtgww";

function Icon() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Icon">
          <path d={svgPaths.p1d1e8e90} id="Vector" stroke="var(--stroke-0, #8D939D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d={svgPaths.p38d12800} id="Vector_2" stroke="var(--stroke-0, #8D939D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d="M5.25 10.5L8.75 7L5.25 3.5" id="Vector" stroke="var(--stroke-0, #CFD3DE)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[20px] relative shrink-0 w-[71.094px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[71.094px]">
        <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[20px] left-[36px] text-[#8d939d] text-[14px] text-center text-nowrap top-[-0.5px] translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          Repositorio
        </p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-full">
        <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[20px] left-0 text-[#233155] text-[14px] text-nowrap top-[-0.5px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          Categorías IA
        </p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon />
      <Icon1 />
      <Button />
      <Icon1 />
      <Text />
    </div>
  );
}

export default function Container1() {
  return (
    <div className="bg-white relative size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#cfd3de] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-px pl-[24px] pr-[739.961px] pt-[16px] relative size-full">
          <Container />
        </div>
      </div>
    </div>
  );
}