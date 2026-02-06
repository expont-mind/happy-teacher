"use client";

import { useState, useEffect, useMemo } from "react";
import { DeliveryInfo, PickupLocation } from "@/src/types";
import {
  deliveryConfig,
  DeliveryZone,
  DeliveryLocation,
  countrysideNames,
} from "@/src/data/deliveryZones";
import { getPickupLocations } from "@/src/utils/delivery";
import {
  MapPin,
  Phone,
  User,
  FileText,
  ChevronDown,
  Truck,
  Store,
  Mountain,
} from "lucide-react";

interface DeliveryFormProps {
  onSubmit: (deliveryInfo: DeliveryInfo) => void;
  onCancel: () => void;
  isLoading?: boolean;
  productPrice: number;
}

export const DeliveryForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  productPrice,
}: DeliveryFormProps) => {
  const [locationType, setLocationType] = useState<
    "ulaanbaatar" | "countryside" | "pickup"
  >("ulaanbaatar");
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<DeliveryLocation | null>(null);
  const [selectedCountryside, setSelectedCountryside] = useState<string>("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [notes, setNotes] = useState("");

  // Pickup state
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] =
    useState<PickupLocation | null>(null);
  const [pickupLocationsLoading, setPickupLocationsLoading] = useState(false);

  // Fetch pickup locations when pickup tab is selected
  useEffect(() => {
    if (locationType === "pickup" && pickupLocations.length === 0) {
      const fetchPickupLocations = async () => {
        setPickupLocationsLoading(true);
        try {
          const locations = await getPickupLocations();
          setPickupLocations(locations);
        } catch (err) {
          console.error("Error fetching pickup locations:", err);
        } finally {
          setPickupLocationsLoading(false);
        }
      };
      fetchPickupLocations();
    }
  }, [locationType, pickupLocations.length]);

  const deliveryFee = useMemo(() => {
    if (locationType === "pickup") {
      return 0;
    }
    return locationType === "ulaanbaatar"
      ? selectedLocation?.fee || 0
      : deliveryConfig.countryside.fees[selectedCountryside] || 0;
  }, [locationType, selectedLocation, selectedCountryside]);

  const isFormValid = useMemo(() => {
    if (locationType === "pickup") {
      return phone.trim() !== "" && selectedPickupLocation !== null;
    }
    return (
      recipientName.trim() !== "" &&
      phone.trim() !== "" &&
      address.trim() !== "" &&
      ((locationType === "ulaanbaatar" && selectedZone && selectedLocation) ||
        (locationType === "countryside" && selectedCountryside))
    );
  }, [
    locationType,
    phone,
    selectedPickupLocation,
    recipientName,
    address,
    selectedZone,
    selectedLocation,
    selectedCountryside,
  ]);

  const handleLocationTypeChange = (
    type: "ulaanbaatar" | "countryside" | "pickup",
  ) => {
    setLocationType(type);
    // Reset mode-specific selections
    if (type !== "ulaanbaatar") {
      setSelectedZone(null);
      setSelectedLocation(null);
    }
    if (type !== "countryside") {
      setSelectedCountryside("");
    }
    if (type !== "pickup") {
      setSelectedPickupLocation(null);
    }
  };

  const handleSubmit = () => {
    if (!isFormValid) return;

    let deliveryInfo: DeliveryInfo;

    if (locationType === "pickup") {
      deliveryInfo = {
        type: "pickup",
        zone_id: "pickup",
        zone_name: "Очиж авах",
        location_id: selectedPickupLocation!.id,
        location_name: selectedPickupLocation!.name,
        delivery_fee: 0,
        address: selectedPickupLocation!.address,
        phone,
        recipient_name: "",
        pickup_location_id: selectedPickupLocation!.id,
        pickup_location_name: selectedPickupLocation!.name,
        pickup_location_address: selectedPickupLocation!.address,
      };
    } else {
      deliveryInfo = {
        type: "delivery",
        zone_id:
          locationType === "ulaanbaatar" ? selectedZone!.id : "countryside",
        zone_name:
          locationType === "ulaanbaatar"
            ? selectedZone!.name
            : "Хөдөө орон нутаг",
        location_id:
          locationType === "ulaanbaatar"
            ? selectedLocation!.id
            : selectedCountryside,
        location_name:
          locationType === "ulaanbaatar"
            ? selectedLocation!.name
            : countrysideNames[selectedCountryside] || selectedCountryside,
        delivery_fee: deliveryFee,
        address,
        phone,
        recipient_name: recipientName,
        notes: notes || undefined,
      };
    }

    onSubmit(deliveryInfo);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#58CC02]/10 rounded-2xl flex items-center justify-center">
          <Truck className="w-6 h-6 text-[#58CC02]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#4B5563] font-nunito">
            Хүргэлтийн мэдээлэл
          </h2>
          <p className="text-sm text-gray-400 font-nunito">
            Бараа хүргүүлэх хаягаа оруулна уу
          </p>
        </div>
      </div>

      {/* Location Type Toggle - Three Options */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
        <button
          onClick={() => handleLocationTypeChange("ulaanbaatar")}
          className={`flex-1 py-3 px-2 rounded-xl font-bold font-nunito text-xs sm:text-sm transition-all flex items-center justify-center gap-1 ${
            locationType === "ulaanbaatar"
              ? "bg-white text-[#4B5563] shadow-sm"
              : "text-gray-400"
          }`}
        >
          <MapPin size={14} className="shrink-0" />
          <span>Улаанбаатар</span>
        </button>
        <button
          onClick={() => handleLocationTypeChange("countryside")}
          className={`flex-1 py-3 px-2 rounded-xl font-bold font-nunito text-xs sm:text-sm transition-all flex items-center justify-center gap-1 ${
            locationType === "countryside"
              ? "bg-white text-[#4B5563] shadow-sm"
              : "text-gray-400"
          }`}
        >
          <Mountain size={14} className="shrink-0" />
          <span>Хөдөө</span>
        </button>
        <button
          onClick={() => handleLocationTypeChange("pickup")}
          className={`flex-1 py-3 px-2 rounded-xl font-bold font-nunito text-xs sm:text-sm transition-all flex items-center justify-center gap-1 ${
            locationType === "pickup"
              ? "bg-white text-[#4B5563] shadow-sm"
              : "text-gray-400"
          }`}
        >
          <Store size={14} className="shrink-0" />
          <span>Очиж авах</span>
        </button>
      </div>

      {/* Ulaanbaatar Zone Selection */}
      {locationType === "ulaanbaatar" && (
        <div className="space-y-4">
          {/* Zone Select */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-500 font-nunito mb-2">
              Бүс сонгох
            </label>
            <div className="relative">
              <select
                value={selectedZone?.id || ""}
                onChange={(e) => {
                  const zone = deliveryConfig.zones.find(
                    (z) => z.id === e.target.value,
                  );
                  setSelectedZone(zone || null);
                  setSelectedLocation(null);
                }}
                className="w-full p-4 pr-10 bg-gray-50 border-2 border-gray-200 rounded-2xl font-nunito font-bold text-[#4B5563] appearance-none focus:outline-none focus:border-[#58CC02] transition-colors"
              >
                <option value="">Бүс сонгоно уу</option>
                {deliveryConfig.zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} - {zone.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Location Select */}
          {selectedZone && (
            <div className="relative">
              <label className="block text-sm font-bold text-gray-500 font-nunito mb-2">
                Байршил сонгох
              </label>
              <div className="relative">
                <select
                  value={selectedLocation?.id || ""}
                  onChange={(e) => {
                    const loc = selectedZone.locations.find(
                      (l) => l.id === e.target.value,
                    );
                    setSelectedLocation(loc || null);
                  }}
                  className="w-full p-4 pr-10 bg-gray-50 border-2 border-gray-200 rounded-2xl font-nunito font-bold text-[#4B5563] appearance-none focus:outline-none focus:border-[#58CC02] transition-colors"
                >
                  <option value="">Байршил сонгоно уу</option>
                  {selectedZone.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} - {loc.fee.toLocaleString()}₮
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Countryside Selection */}
      {locationType === "countryside" && (
        <div className="relative">
          <label className="block text-sm font-bold text-gray-500 font-nunito mb-2">
            Аймаг сонгох
          </label>
          <div className="relative">
            <select
              value={selectedCountryside}
              onChange={(e) => setSelectedCountryside(e.target.value)}
              className="w-full p-4 pr-10 bg-gray-50 border-2 border-gray-200 rounded-2xl font-nunito font-bold text-[#4B5563] appearance-none focus:outline-none focus:border-[#58CC02] transition-colors"
            >
              <option value="">Аймаг сонгоно уу</option>
              {Object.entries(countrysideNames).map(([key, name]) => (
                <option key={key} value={key}>
                  {name} -{" "}
                  {deliveryConfig.countryside.fees[key]?.toLocaleString()}₮
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Pickup Location Selection */}
      {locationType === "pickup" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-500 font-nunito mb-3">
              Очиж авах байршил сонгох
            </label>

            {pickupLocationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#58CC02]/30 border-t-[#58CC02] rounded-full animate-spin" />
              </div>
            ) : pickupLocations.length === 0 ? (
              <div className="text-center py-8 text-gray-400 font-nunito">
                Одоогоор очиж авах байршил байхгүй байна
              </div>
            ) : (
              <div className="space-y-3">
                {pickupLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedPickupLocation(location)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedPickupLocation?.id === location.id
                        ? "border-[#58CC02] bg-[#58CC02]/5"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          selectedPickupLocation?.id === location.id
                            ? "border-[#58CC02] bg-[#58CC02]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedPickupLocation?.id === location.id && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#4B5563] font-nunito">
                          {location.name}
                        </p>
                        <p className="text-sm text-gray-400 font-nunito mt-1">
                          {location.address}
                        </p>
                        {location.description && (
                          <p className="text-xs text-gray-300 font-nunito mt-1">
                            {location.description}
                          </p>
                        )}
                      </div>
                      <Store className="w-5 h-5 text-gray-300 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number - Required for pickup */}
          <div>
            <label className="block text-sm font-bold text-gray-500 font-nunito mb-2">
              Утасны дугаар
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="99001122"
                className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl font-nunito font-bold text-[#4B5563] placeholder:text-gray-300 focus:outline-none focus:border-[#58CC02] transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delivery mode fields (not for pickup) */}
      {locationType !== "pickup" && (
        <>
          {/* Recipient Name */}
          <div>
            <label className="block text-sm font-bold text-gray-500 font-nunito mb-2">
              Хүлээн авагчийн нэр
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Нэрээ оруулна уу"
                className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl font-nunito font-bold text-[#4B5563] placeholder:text-gray-300 focus:outline-none focus:border-[#58CC02] transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-500 font-nunito mb-2">
              Утасны дугаар
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="99001122"
                className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl font-nunito font-bold text-[#4B5563] placeholder:text-gray-300 focus:outline-none focus:border-[#58CC02] transition-colors"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-gray-500 font-nunito mb-2">
              Дэлгэрэнгүй хаяг
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Байр, тоот, давхар гэх мэт..."
                rows={3}
                className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl font-nunito font-bold text-[#4B5563] placeholder:text-gray-300 focus:outline-none focus:border-[#58CC02] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-500 font-nunito mb-2">
              Нэмэлт тэмдэглэл (Заавал биш)
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Жишээ: Хаалга дээр нь тавиад явна уу..."
                rows={2}
                className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-2xl font-nunito font-bold text-[#4B5563] placeholder:text-gray-300 focus:outline-none focus:border-[#58CC02] transition-colors resize-none"
              />
            </div>
          </div>
        </>
      )}

      {/* Price Summary */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-nunito font-bold">
            Хүргэлтийн төлбөр
          </span>
          <span
            className={`font-nunito font-bold ${locationType === "pickup" ? "text-[#58CC02]" : "text-[#4B5563]"}`}
          >
            {locationType === "pickup"
              ? "Үнэгүй"
              : deliveryFee > 0
                ? `${deliveryFee.toLocaleString()}₮`
                : "-"}
          </span>
        </div>
        <div className="h-px bg-gray-200 my-2" />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-4 rounded-2xl font-extrabold font-nunito text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Буцах
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="flex-1 py-4 rounded-2xl font-extrabold font-nunito text-sm text-white bg-[#58CC02] shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            "Баталгаажуулах"
          )}
        </button>
      </div>
    </div>
  );
};
