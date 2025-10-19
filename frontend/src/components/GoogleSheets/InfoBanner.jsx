import { Info } from "lucide-react";

const InfoBanner = () => {
  return (
    <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-300">
          <p className="font-semibold mb-2">📊 Multi-Sheet Support:</p>
          <ul className="space-y-1 list-disc ml-4">
            <li>Connect multiple sheets from the same spreadsheet</li>
            <li>Activate specific sheets for AI analysis</li>
            <li>AI analyzes only data from activated sheets</li>
            <li>Sync anytime to get latest updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;
