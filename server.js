require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const ROBLOX_SCRIPT = `
-- Remove previous GUI if exists
if game:GetService("Players").LocalPlayer.PlayerGui:FindFirstChild("LollipopAutoGUI") then
	game:GetService("Players").LocalPlayer.PlayerGui:FindFirstChild("LollipopAutoGUI"):Destroy()
end

-- Services
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Player = Players.LocalPlayer
local PlayerGui = Player:WaitForChild("PlayerGui")

-- GUI Setup
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "LollipopAutoGUI"
ScreenGui.ResetOnSpawn = false
ScreenGui.Parent = PlayerGui

local MainFrame = Instance.new("Frame")
MainFrame.Size = UDim2.new(0, 200, 0, 140)
MainFrame.Position = UDim2.new(0, 100, 0, 100)
MainFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
MainFrame.BorderSizePixel = 0
MainFrame.Name = "MainFrame"
MainFrame.Parent = ScreenGui
MainFrame.Active = true
MainFrame.Draggable = true

Instance.new("UICorner", MainFrame).CornerRadius = UDim.new(0, 8)

-- Title
local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(1, -40, 0, 25)
Title.Position = UDim2.new(0, 10, 0, 0)
Title.Text = "🍭 Lollipop Auto"
Title.TextColor3 = Color3.fromRGB(255, 255, 255)
Title.BackgroundTransparency = 1
Title.Font = Enum.Font.GothamBold
Title.TextSize = 16
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Parent = MainFrame

-- Minimize Button
local Minimize = Instance.new("TextButton")
Minimize.Size = UDim2.new(0, 20, 0, 20)
Minimize.Position = UDim2.new(1, -45, 0, 2)
Minimize.Text = "➖"
Minimize.TextColor3 = Color3.fromRGB(255, 255, 255)
Minimize.BackgroundTransparency = 1
Minimize.Font = Enum.Font.GothamBold
Minimize.TextSize = 16
Minimize.Parent = MainFrame

-- Close Button
local Close = Instance.new("TextButton")
Close.Size = UDim2.new(0, 20, 0, 20)
Close.Position = UDim2.new(1, -25, 0, 2)
Close.Text = "❌"
Close.TextColor3 = Color3.fromRGB(255, 100, 100)
Close.BackgroundTransparency = 1
Close.Font = Enum.Font.GothamBold
Close.TextSize = 16
Close.Parent = MainFrame

-- Toggle Button
local Toggle = Instance.new("TextButton")
Toggle.Size = UDim2.new(0.9, 0, 0, 40)
Toggle.Position = UDim2.new(0.05, 0, 0.35, 0)
Toggle.Text = "Start Auto Buy"
Toggle.TextColor3 = Color3.fromRGB(255, 255, 255)
Toggle.BackgroundColor3 = Color3.fromRGB(70, 130, 180)
Toggle.Font = Enum.Font.GothamBold
Toggle.TextSize = 14
Toggle.Parent = MainFrame

Instance.new("UICorner", Toggle).CornerRadius = UDim.new(0, 6)

-- Notification Label
local Notif = Instance.new("TextLabel")
Notif.Size = UDim2.new(1, -20, 0, 25)
Notif.Position = UDim2.new(0, 10, 1, -30)
Notif.BackgroundTransparency = 1
Notif.Text = "Status: Idle"
Notif.TextColor3 = Color3.fromRGB(200, 255, 200)
Notif.Font = Enum.Font.Gotham
Notif.TextSize = 14
Notif.TextXAlignment = Enum.TextXAlignment.Left
Notif.Parent = MainFrame

-- Minimize Function
local minimized = false
Minimize.MouseButton1Click:Connect(function()
	minimized = not minimized
	for _, child in ipairs(MainFrame:GetChildren()) do
		if child ~= Title and child ~= Minimize and child ~= Close and child:IsA("GuiObject") then
			child.Visible = not minimized
		end
	end
end)

-- Close Function
Close.MouseButton1Click:Connect(function()
	ScreenGui:Destroy()
end)

-- Auto Buy Logic
local autoBuy = false
Toggle.MouseButton1Click:Connect(function()
	autoBuy = not autoBuy
	Toggle.Text = autoBuy and "Stop Auto Buy" or "Start Auto Buy"
	Notif.Text = autoBuy and "Status: Attempting..." or "Status: Idle"

	if autoBuy then
		task.spawn(function()
			while autoBuy do
				-- Send restock request
				pcall(function()
					local restockArgs = {
						string.char(10, 0, 0, 17, 74, 85, 154, 65)
					}
					ReplicatedStorage:WaitForChild("ByteNetReliable"):FireServer(unpack(restockArgs))
				end)

				-- Wait briefly then attempt to buy
				task.wait(1.5)

				-- Attempt to buy Lollipop
				local success, err = pcall(function()
					ReplicatedStorage:WaitForChild("GameEvents"):WaitForChild("BuyGearStock"):FireServer("Levelup Lollipop")
				end)

				-- Check if actually restocked
				local gearRestocks = ReplicatedStorage:FindFirstChild("GearRestocks")
				local lollipopRestock = gearRestocks and gearRestocks:FindFirstChild("Levelup Lollipop")
				local hasStock = lollipopRestock and lollipopRestock.Value > 0

				if success and hasStock then
					Notif.Text = "✅ Bought Lollipop!"
				elseif not hasStock then
					Notif.Text = "⏳ Waiting for restock..."
				else
					Notif.Text = "❌ Failed to buy"
				end

				task.wait(1.5)
			end
		end)
	end
end)
`;

app.get('/script', (req, res) => {
  const token = req.query.token;
  if (token !== ACCESS_TOKEN) {
    return res.status(403).send("INVALID");
  }
  res.send(ROBLOX_SCRIPT);
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});





