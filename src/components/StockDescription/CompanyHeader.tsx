import { useState } from 'react';
import type { CompanyProfile } from '../../types/fmp';

interface CompanyHeaderProps {
  profile: CompanyProfile | null;
}

export function CompanyHeader({ profile }: CompanyHeaderProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!profile) return null;

  const truncatedDescription = profile.description?.slice(0, 200);
  const hasMore = profile.description?.length > 200;

  return (
    <div className="px-2 py-1.5">
      {/* Company Info Row */}
      <div className="flex items-start gap-2 mb-1.5">
        {/* Logo and Name */}
        <div className="flex items-center gap-2">
          {profile.image && (
            <img
              src={profile.image}
              alt={profile.companyName}
              className="w-7 h-7 rounded bg-white p-0.5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-text-primary font-semibold text-sm">{profile.companyName}</h2>
              <span className="bg-accent-blue text-white text-[10px] px-1 py-0.5 rounded font-semibold">
                EQ
              </span>
            </div>
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue text-xs hover:underline flex items-center gap-0.5"
              >
                <span>↗</span> {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            )}
          </div>
        </div>

        {/* Address and CEO */}
        <div className="ml-auto text-right text-xs text-text-primary">
          <p>{profile.city}, {profile.state}</p>
          <p>CEO: {profile.ceo}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-text-primary text-xs leading-relaxed">
        {showFullDescription ? profile.description : truncatedDescription}
        {hasMore && !showFullDescription && '... '}
        {hasMore && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-accent-blue hover:underline"
          >
            {showFullDescription ? 'less' : 'more'}
          </button>
        )}
      </p>
    </div>
  );
}
