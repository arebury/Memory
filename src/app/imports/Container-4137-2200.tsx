import svgPaths from "./svg-ys09cyf8ya";

function Heading() {
  return (
    <div className="h-[16px] relative shrink-0 w-[110.094px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[110.094px]">
        <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#8d939d] text-[12px] text-nowrap top-0 tracking-[0.3px] uppercase whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          Regla vinculada
        </p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M12 4L4 12" id="Vector" stroke="var(--stroke-0, #8D939D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M4 4L12 12" id="Vector_2" stroke="var(--stroke-0, #8D939D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Button />
    </div>
  );
}

function RuleQuickViewPanel() {
  return (
    <div className="h-[45px] relative shrink-0 w-[398px]" data-name="RuleQuickViewPanel">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[45px] items-start pb-px pt-[10px] px-[16px] relative w-[398px]">
        <Container />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[366px]" data-name="Heading 4">
      <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[24px] left-0 text-[#233155] text-[16px] text-nowrap top-[0.5px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        2134234 (Copia)df (Copia)
      </p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[16px] left-0 top-[32px] w-[366px]" data-name="Paragraph">
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#8d939d] text-[12px] text-nowrap top-0 whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        23423424
      </p>
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-gray-200 border border-[rgba(0,0,0,0)] border-solid h-[22px] left-0 overflow-clip rounded-[8px] top-[58.5px] w-[60.211px]" data-name="Badge">
      <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-[8px] text-[#030213] text-[12px] text-nowrap top-[2px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Inactiva
      </p>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[80.5px] relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Paragraph />
      <Badge />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Heading 5">
      <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#8d939d] text-[12px] text-nowrap top-0 uppercase whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Condiciones
      </p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4137_2208)" id="Icon">
          <path d={svgPaths.p3d16e300} id="Vector" stroke="var(--stroke-0, #60D3E4)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_4137_2208">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[16px] relative shrink-0 w-[48.633px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[48.633px]">
        <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#8d939d] text-[12px] text-nowrap top-0 whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          Servicios
        </p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[6px] h-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon1 />
      <Text />
    </div>
  );
}

function Badge1() {
  return (
    <div className="absolute bg-white h-[20px] left-0 rounded-[8px] top-0 w-[111.008px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[20px] items-center justify-center overflow-clip px-[9px] py-[3px] relative rounded-[inherit] w-[111.008px]">
        <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[16px] relative shrink-0 text-[12px] text-neutral-950 text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          dv-smart-contact
        </p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Badge2() {
  return (
    <div className="absolute bg-white h-[20px] left-[115.01px] rounded-[8px] top-0 w-[103.086px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] h-[20px] items-center justify-center overflow-clip px-[9px] py-[3px] relative rounded-[inherit] w-[103.086px]">
        <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[16px] relative shrink-0 text-[12px] text-neutral-950 text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          soporte-tecnico
        </p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <Badge1 />
      <Badge2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#f4f6fc] h-[58px] relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[6px] h-[58px] items-start pb-0 pt-[8px] px-[8px] relative w-full">
          <Container2 />
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[82px] items-start relative shrink-0 w-full" data-name="Section">
      <Heading2 />
      <Container4 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Heading 5">
      <p className="absolute font-['Roboto:Medium',sans-serif] font-medium leading-[16px] left-0 text-[#8d939d] text-[12px] text-nowrap top-0 uppercase whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Acciones
      </p>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[114px] items-start relative shrink-0 w-full" data-name="Container">
      <Section />
      <Heading3 />
    </div>
  );
}

function RuleQuickViewPanel1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[398px]" data-name="RuleQuickViewPanel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[16px] h-full items-start overflow-clip pb-0 pt-[16px] px-[16px] relative rounded-[inherit] w-[398px]">
        <Container1 />
        <Container5 />
      </div>
    </div>
  );
}

export default function Container6() {
  return (
    <div className="bg-white relative rounded-[10px] size-full" data-name="Container">
      <div className="box-border content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <RuleQuickViewPanel />
        <RuleQuickViewPanel1 />
      </div>
      <div aria-hidden="true" className="absolute border border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
    </div>
  );
}