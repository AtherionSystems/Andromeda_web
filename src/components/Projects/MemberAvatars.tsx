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
    <div style={{ display: "flex", marginTop: 10 }}>
      {visible.map((member, i) => (
        <div
          key={i}
          title={member.name} // tooltip con nombre completo
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: member.color,
            border: "2px solid #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 600,
            color: "#fff",
            marginLeft: i === 0 ? 0 : -4, // solapamiento
            zIndex: visible.length - i, // el primero queda encima
            cursor: "default",
          }}
        >
          {member.initials}
        </div>
      ))}

      {/* Desbordamiento: "+2", "+5", etc. */}
      {overflow > 0 && (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#d0dde0",
            border: "2px solid #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 600,
            color: "#4a6a7a",
            marginLeft: -4,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

export default MemberAvatars;
