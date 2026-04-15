import React from "react";
import type { Member } from "../../types/project";

interface MemberAvatarsProps {
  members: Member[];
  max?: number;
}

const MemberAvatars: React.FC<MemberAvatarsProps> = ({ members, max = 4 }) => {
  // Miembros visibles y los que se colapsan en "+N"
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className="flex mt-2.5">
      {visible.map((member, i) => (
        <div
          key={i}
          title={member.name}
          style={{
            background: member.color,
            marginLeft: i === 0 ? 0 : -4,
            zIndex: visible.length - i,
          }}
          className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-semibold text-white cursor-default"
        >
          {member.initials}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{ marginLeft: -4 }}
          className="w-6 h-6 rounded-full border-2 border-white bg-[#d0dde0] flex items-center justify-center text-[9px] font-semibold text-[#4a6a7a]"
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

export default MemberAvatars;
