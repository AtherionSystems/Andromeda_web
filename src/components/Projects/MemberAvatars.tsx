import React from "react";
import { useTheme } from "../../contexts/useTheme";
import type { Member } from "../../types/project";

interface MemberAvatarsProps {
  members: Member[];
  max?: number;
}

const MemberAvatars: React.FC<MemberAvatarsProps> = ({ members, max = 4 }) => {
  // Miembros visibles y los que se colapsan en "+N"
  const visible = members.slice(0, max);
  const overflow = members.length - max;
  const { darkMode } = useTheme();

  return (
    <div className="flex mt-2.5">
      {visible.map((member, i) => (
        <div
          key={i}
          title={member.name}
          style={
            member.color && !member.color.startsWith("bg-")
              ? {
                  background: member.color,
                  marginLeft: i === 0 ? 0 : -4,
                  zIndex: visible.length - i,
                }
              : { marginLeft: i === 0 ? 0 : -4, zIndex: visible.length - i }
          }
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-semibold text-white cursor-default ${
              darkMode ? "border-slate-800" : "border-white"
            } ${
            member.color && member.color.startsWith("bg-") ? member.color : ""
          }`}
        >
          {member.initials}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{ marginLeft: -4 }}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-semibold ${
            darkMode ? "border-slate-800 bg-slate-700 text-slate-100" : "border-white bg-[#d0dde0] text-[#4a6a7a]"
          }`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

export default MemberAvatars;
