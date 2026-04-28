import svgPaths from "./svg-4o4ubnq2lw";

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p19416e00} id="Vector" stroke="var(--stroke-0, #60D3E4)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3e059a80} id="Vector_2" stroke="var(--stroke-0, #60D3E4)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.66667 6H5.33333" id="Vector_3" stroke="var(--stroke-0, #60D3E4)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.6667 8.66667H5.33333" id="Vector_4" stroke="var(--stroke-0, #60D3E4)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.6667 11.3333H5.33333" id="Vector_5" stroke="var(--stroke-0, #60D3E4)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-[#8d939d] relative rounded-[1.67772e+07px] shrink-0 size-[8px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[8px]" />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[8px] h-[32px] items-center justify-center p-px relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container />
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[16px] relative shrink-0 text-[#8d939d] text-[12px] text-center text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Grabación
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 w-[96.711px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] items-start relative w-[96.711px]">
        <Button />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[8px] h-[32px] items-center justify-center p-px relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[16px] relative shrink-0 text-[#8d939d] text-[12px] text-center text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        T
      </p>
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[16px] relative shrink-0 text-[#8d939d] text-[12px] text-center text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Transcripción
      </p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 w-[114.695px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] items-start relative w-[114.695px]">
        <Button1 />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[16px] relative shrink-0 w-[11.461px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[11.461px]">
        <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-[6px] text-[#8d939d] text-[12px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          IA
        </p>
      </div>
    </div>
  );
}

function RuleFilterButton() {
  return (
    <div className="h-[16px] relative shrink-0 w-[69.164px]" data-name="RuleFilterButton">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[69.164px]">
        <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-[35px] text-[#8d939d] text-[12px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          Clasificación
        </p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white h-[32px] relative rounded-[8px] shrink-0 w-[114.625px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[32px] items-center justify-center p-px relative w-[114.625px]">
        <Text />
        <RuleFilterButton />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="basis-0 grow h-[32px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[32px] items-center relative w-full">
        <Frame />
        <Frame1 />
        <Button2 />
      </div>
    </div>
  );
}

function RulesFilterBar() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="RulesFilterBar">
      <Icon />
      <Container1 />
    </div>
  );
}

export default function Frame2() {
  return (
    <div className="relative rounded-[8px] size-full">
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start p-[8px] relative size-full">
          <RulesFilterBar />
        </div>
      </div>
    </div>
  );
}